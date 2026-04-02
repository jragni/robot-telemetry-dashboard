import { useCallback, useMemo, useState } from 'react';
import type { Ros } from 'roslib';
import { useRosSubscriber } from '@/hooks/useRosSubscriber';
import type { BatteryStateMessage } from '@/types/ros2-messages.types';
import type { RosTopic } from '@/hooks/useRosTopics';
import type { BatteryStatus } from '@/types/battery.types';

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
    const { percentage, voltage, power_supply_status } = msg as BatteryStateMessage;
    // ROS BatteryState.percentage can be 0-1 (fraction) or 0-100 (percent)
    const pct = percentage > 1 ? percentage : percentage * 100;
    setBattery({
      percentage: pct,
      voltage,
      charging: power_supply_status === POWER_SUPPLY_CHARGING,
    });
  }, []);

  useRosSubscriber(
    ros,
    batteryTopic,
    'sensor_msgs/msg/BatteryState',
    onMessage,
  );

  return battery;
}
