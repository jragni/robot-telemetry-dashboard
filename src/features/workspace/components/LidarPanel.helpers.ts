import type { LidarPoint } from '@/features/workspace/types/LidarPanel.types';

/** Finds the minimum distance in a LiDAR points array without spreading. */
export function findMinDistance(points: readonly LidarPoint[]): number {
  let min = Infinity;
  for (const p of points) {
    if (p.distance < min) min = p.distance;
  }
  return min;
}
