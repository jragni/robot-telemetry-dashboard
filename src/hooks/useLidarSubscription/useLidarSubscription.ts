import { useMemo, useState } from 'react';
import type { Ros } from 'roslib';

import { useRosSubscriber } from '../useRosSubscriber';
import type { LidarPoint } from '@/types/lidar.types';

import { LIDAR_DISPLAY_RANGE } from './constants';
import { laserScanMessageSchema } from './schemas';
import type { UseLidarReturn } from './types';

/** useLidarSubscription
 * @description Subscribes to a sensor_msgs/msg/LaserScan topic and parses valid range
 *  readings into polar coordinates. setPoints is called directly: useRosSubscriber
 *  coalesces incoming messages to one per animation frame (this hook passes
 *  `coalesce: true` explicitly so the contract is pinned at the call site), so wrapping
 *  setPoints in another rafThrottle was redundant and added one frame of display
 *  latency (T-161).
 * @param ros - Active roslib connection, or undefined when disconnected.
 * @param topicName - The LaserScan topic name to subscribe to.
 */
export function useLidarSubscription(ros: Ros | undefined, topicName: string): UseLidarReturn {
  const [points, setPoints] = useState<readonly LidarPoint[]>([]);

  const onMessage = useMemo(
    () => (msg: unknown) => {
      try {
        const result = laserScanMessageSchema.safeParse(msg);
        if (!result.success) {
          console.warn('[useLidarSubscription] Malformed message:', result.error.issues);
          return;
        }
        const m = result.data;
        const parsed: LidarPoint[] = [];
        for (let i = 0; i < m.ranges.length; i++) {
          const range = m.ranges[i];
          if (
            range === null ||
            range === undefined ||
            !Number.isFinite(range) ||
            range < m.range_min ||
            range > m.range_max
          )
            continue;
          parsed.push({
            angle: m.angle_min + i * m.angle_increment,
            distance: range,
            intensity: m.intensities[i] ?? 0,
          });
        }
        setPoints(parsed);
      } catch (err) {
        console.warn('[useLidarSubscription] Unexpected error processing message:', err);
      }
    },
    [],
  );

  useRosSubscriber(ros, topicName, 'sensor_msgs/msg/LaserScan', onMessage, {
    coalesce: true,
    throttleRate: 200,
  });

  return { points, rangeMax: LIDAR_DISPLAY_RANGE };
}
