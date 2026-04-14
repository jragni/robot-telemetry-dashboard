import { useEffect, useMemo, useState } from 'react';
import type { Ros } from 'roslib';
import { z } from 'zod';
import { useRosSubscriber } from '../useRosSubscriber';
import { rafThrottle } from '@/utils';
import type { LidarPoint } from '@/types/lidar.types';
import type { UseLidarReturn } from './useLidarSubscription.types';

/** laserScanMessageSchema
 * @description Zod schema validating the consumed fields of sensor_msgs/msg/LaserScan.
 *  Ranges and intensities use nullable arrays to handle rosbridge null serialization.
 */
export const laserScanMessageSchema = z.object({
  angle_increment: z.number(),
  angle_min: z.number(),
  intensities: z
    .array(z.number().nullable())
    .nullable()
    .optional()
    .transform((v) => v ?? []),
  range_max: z.number(),
  range_min: z.number(),
  ranges: z
    .array(z.number().nullable())
    .nullable()
    .transform((v) => v ?? []),
});
const LIDAR_DISPLAY_RANGE = 15;

/** useLidarSubscription
 * @description Subscribes to a sensor_msgs/msg/LaserScan topic, parses valid range readings
 *  into polar coordinates, and throttles updates to animation frame rate.
 * @param ros - Active roslib connection, or undefined when disconnected.
 * @param topicName - The LaserScan topic name to subscribe to.
 */
export function useLidarSubscription(ros: Ros | undefined, topicName: string): UseLidarReturn {
  const [points, setPoints] = useState<readonly LidarPoint[]>([]);

  const throttledSet = useMemo(
    () =>
      rafThrottle((p: readonly LidarPoint[]) => {
        setPoints(p);
      }),
    [],
  );

  useEffect(() => {
    return () => {
      throttledSet.cancel();
    };
  }, [throttledSet]);

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
        throttledSet(parsed);
      } catch (err) {
        console.warn('[useLidarSubscription] Unexpected error processing message:', err);
      }
    },
    [throttledSet],
  );

  useRosSubscriber(ros, topicName, 'sensor_msgs/msg/LaserScan', onMessage, { throttleRate: 200 });

  return { points, rangeMax: LIDAR_DISPLAY_RANGE };
}
