import { useCallback, useMemo, useState } from 'react';
import type { Ros } from 'roslib';
import { useRosSubscriber } from '@/hooks/useRosSubscriber';
import type { BatteryStateMessage } from '@/types/ros2-messages.types';
import type { RosTopic } from '@/hooks/useRosTopics';
import type { BatteryStatus } from '@/features/workspace/types/SystemStatusPanel.types';

/** POWER_SUPPLY_CHARGING
 * @description sensor_msgs/msg/BatteryState power_supply_status value for charging.
 */
const POWER_SUPPLY_CHARGING = 1;

/** useBatterySubscription
 * @description Auto-discovers a BatteryState topic from the available topics
 *  list, subscribes to it, and returns normalized battery status.
 * @param ros - Live Ros instance, or undefined.
 * @param availableTopics - List of discovered topics from the robot.
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

  const onMessage = useCallback((msg: BatteryStateMessage) => {
    // ROS BatteryState.percentage can be 0-1 (fraction) or 0-100 (percent)
    const pct = msg.percentage > 1 ? msg.percentage : msg.percentage * 100;
    setBattery({
      percentage: pct,
      voltage: msg.voltage,
      charging: msg.power_supply_status === POWER_SUPPLY_CHARGING,
    });
  }, []);

  useRosSubscriber<BatteryStateMessage>(
    ros,
    batteryTopic,
    'sensor_msgs/msg/BatteryState',
    onMessage,
  );

  return battery;
}
