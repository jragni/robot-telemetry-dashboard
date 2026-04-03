import { useMemo, useState } from 'react';
import type { Ros } from 'roslib';
import { z } from 'zod';
import { useRosSubscriber } from '@/hooks/useRosSubscriber';
import { rafThrottle } from '@/utils/rafThrottle';
import type { LidarPoint } from '@/features/workspace/types/LidarPanel.types';

export const laserScanMessageSchema = z.object({
  angle_increment: z.number(),
  angle_min: z.number(),
  intensities: z.array(z.number()).optional().default([]),
  range_max: z.number(),
  range_min: z.number(),
  ranges: z.array(z.number()),
});
const LIDAR_DISPLAY_RANGE = 15;

interface UseLidarReturn {
  readonly points: readonly LidarPoint[];
  readonly rangeMax: number;
}

export function useLidarSubscription(ros: Ros | undefined, topicName: string): UseLidarReturn {
  const [points, setPoints] = useState<readonly LidarPoint[]>([]);

  const throttledSet = useMemo(() => rafThrottle((p: readonly LidarPoint[]) => {
    setPoints(p);
  }), []);

  const onMessage = useMemo(() => (msg: unknown) => {
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
        if (range === undefined || !Number.isFinite(range) || range < m.range_min || range > m.range_max) continue;
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
  }, [throttledSet]);

  useRosSubscriber(ros, topicName, 'sensor_msgs/msg/LaserScan', onMessage);

  return { points, rangeMax: LIDAR_DISPLAY_RANGE };
}
