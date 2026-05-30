import { useCallback, useMemo, useState } from 'react';
import type { Ros } from 'roslib';

import { useRosSubscriber } from '../useRosSubscriber';
import type { RosTopic } from '../useRosTopics';
import type { BatteryStatus } from '@/types/battery.types';

import { POWER_SUPPLY_CHARGING } from './constants';
import { batteryStateMessageSchema } from './schemas';

/** useBatterySubscription
 * @description Subscribes to the first sensor_msgs/msg/BatteryState topic discovered
 *  and returns parsed battery status (percentage, voltage, charging state).
 * @param ros - Active roslib connection, or undefined when disconnected.
 * @param availableTopics - List of discovered ROS topics to search for battery state.
 */
export function useBatterySubscription(
  ros: Ros | undefined,
  availableTopics: readonly RosTopic[],
): BatteryStatus | null {
  const [battery, setBattery] = useState<BatteryStatus | null>(null);

  const batteryTopic = useMemo(
    () => availableTopics.find((t) => t.type === 'sensor_msgs/msg/BatteryState')?.name ?? '',
    [availableTopics],
  );

  const onMessage = useCallback((msg: unknown) => {
    try {
      const result = batteryStateMessageSchema.safeParse(msg);
      if (!result.success) {
        console.warn('[useBatterySubscription] Malformed message:', result.error.issues);
        return;
      }
      const { percentage, power_supply_status, voltage } = result.data;
      // ROS BatteryState reports unknown charge as NaN (-> null) or a negative value.
      // A known value may be a 0-1 fraction or a 0-100 percent; normalize then clamp.
      let pct: number | null = null;
      if (percentage !== null && Number.isFinite(percentage) && percentage >= 0) {
        const scaled = percentage > 1 ? percentage : percentage * 100;
        pct = Math.min(scaled, 100);
      }
      setBattery({
        charging: power_supply_status === POWER_SUPPLY_CHARGING,
        percentage: pct,
        // Unknown voltage (rosbridge NaN -> null) stays null; never conflate with a real 0 V reading.
        voltage,
      });
    } catch (err) {
      console.warn('[useBatterySubscription] Unexpected error processing message:', err);
    }
  }, []);

  useRosSubscriber(ros, batteryTopic, 'sensor_msgs/msg/BatteryState', onMessage, {
    throttleRate: 1000,
  });

  return battery;
}
