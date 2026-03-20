import type { LaserScanMessage } from '../types/ros-sensor-messages.types';

/**
 * Convert a LaserScan polar message to a flat Float32Array of [x, y, x, y, ...] pairs.
 * Points outside [range_min, maxRange] or NaN/Infinity are filtered out.
 */
export function polarToCartesian(
  scan: LaserScanMessage,
  maxRange: number
): Float32Array {
  const { angle_min, angle_increment, range_min, ranges } = scan;

  if (angle_increment === 0) {
    console.warn(
      'polarToCartesian: angle_increment is 0 — degenerate scan, single point.'
    );
  }

  const points: number[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];

    if (!isFinite(r) || isNaN(r)) continue;
    if (r < range_min || r > maxRange) continue;

    const angle = angle_min + i * angle_increment;
    points.push(r * Math.cos(angle));
    points.push(r * Math.sin(angle));
  }

  return new Float32Array(points);
}
