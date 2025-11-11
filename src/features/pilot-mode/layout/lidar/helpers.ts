// LIDAR helper functions

import type { LidarPoint } from './definitions';

export function calculateLidarPoint(
  range: number,
  angleMin: number,
  angleIncrement: number,
  index: number,
  viewRange: number
): LidarPoint {
  const angle = angleMin + index * angleIncrement - Math.PI / 2;
  const normalizedRange = (range / viewRange) * 100;
  const x = Math.cos(angle) * normalizedRange;
  const y = Math.sin(angle) * normalizedRange;

  // Distance-based coloring relative to view range
  const distanceRatio = range / viewRange;
  let color: string;
  if (distanceRatio < 0.3) {
    // Near: Red (danger)
    color = 'rgb(239 68 68)';
  } else if (distanceRatio < 0.6) {
    // Medium: Yellow (caution)
    color = 'rgb(234 179 8)';
  } else {
    // Far: Green (safe)
    color = 'rgb(34 197 94)';
  }

  return { x, y, color };
}
