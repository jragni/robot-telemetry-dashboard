import { useMemo, useState } from 'react';
import type { Ros } from 'roslib';
import { useRosSubscriber } from '@/hooks/useRosSubscriber';
import { rafThrottle } from '@/utils/rafThrottle';
import type { LaserScanMessage } from '@/types/ros2-messages.types';
import type { LidarPoint } from '../types/LidarPanel.types';

/** LIDAR_DISPLAY_RANGE
 * @description Fixed display range in meters for the LiDAR panel.
 */
const LIDAR_DISPLAY_RANGE = 15;

interface UseLidarReturn {
  readonly points: readonly LidarPoint[];
  readonly rangeMax: number;
}

/** useLidarSubscription
 * @description Subscribes to a LaserScan topic and normalizes scan data into
 *  an array of LidarPoints. Throttled to RAF cadence.
 * @param ros - Live Ros instance, or undefined.
 * @param topicName - The LaserScan topic (e.g., "/scan").
 */
export function useLidarSubscription(ros: Ros | undefined, topicName: string): UseLidarReturn {
  const [points, setPoints] = useState<readonly LidarPoint[]>([]);

  const throttledSet = useMemo(() => rafThrottle((p: readonly LidarPoint[]) => {
    setPoints(p);
  }), []);

  const onMessage = useMemo(() => (msg: unknown) => {
    const m = msg as LaserScanMessage;
    const parsed: LidarPoint[] = [];
    for (let i = 0; i < m.ranges.length; i++) {
      const range = m.ranges[i];
      if (range === undefined || !Number.isFinite(range) || range < m.range_min || range > m.range_max) continue;
      parsed.push({
        angle: m.angle_min + i * m.angle_increment,
        distance: range,
        intensity: m.intensities[i] ?? 0,
      });
    }
    throttledSet(parsed);
  }, [throttledSet]);

  useRosSubscriber(ros, topicName, 'sensor_msgs/msg/LaserScan', onMessage);

  return { points, rangeMax: LIDAR_DISPLAY_RANGE };
}
