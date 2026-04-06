import { useCallback, useMemo, useState } from 'react';
import type { Ros } from 'roslib';
import { z } from 'zod';
import { useRosSubscriber } from '@/hooks/useRosSubscriber';
import type { RosTopic } from '@/hooks/useRosTopics';
import type { BatteryStatus } from '@/types/battery.types';

export const batteryStateMessageSchema = z.object({
  percentage: z.number(),
  power_supply_status: z.number(),
  voltage: z.number(),
});

// sensor_msgs/msg/BatteryState power_supply_status value for charging
const POWER_SUPPLY_CHARGING = 1;

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
      const { percentage, voltage, power_supply_status } = result.data;
      // ROS BatteryState.percentage can be 0-1 (fraction) or 0-100 (percent)
      const pct = percentage > 1 ? percentage : percentage * 100;
      setBattery({
        percentage: pct,
        voltage,
        charging: power_supply_status === POWER_SUPPLY_CHARGING,
      });
    } catch (err) {
      console.warn('[useBatterySubscription] Unexpected error processing message:', err);
    }
  }, []);

  useRosSubscriber(
    ros,
    batteryTopic,
    'sensor_msgs/msg/BatteryState',
    onMessage,
  );

  return battery;
}
