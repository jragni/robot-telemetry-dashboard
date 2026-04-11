import type { LidarPoint } from './LidarPanel.types';

/** findMinDistance
 * @description Finds the minimum distance in a LiDAR points array using a
 *  manual loop instead of Math.min spread to avoid stack overflow on large scans.
 * @param points - Array of LiDAR scan points with distance values.
 */
export function findMinDistance(points: readonly LidarPoint[]): number {
  let min = Infinity;
  for (const p of points) {
    if (p.distance < min) min = p.distance;
  }
  return min;
}
