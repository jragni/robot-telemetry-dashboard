import type { CartesianPoint, LidarRenderData } from './lidar.types';

import type { LaserScanMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// transformLaserScan
// ---------------------------------------------------------------------------

/**
 * Transforms a ROS sensor_msgs/LaserScan message into a {@link LidarRenderData}
 * object ready for canvas rendering.
 *
 * - Filters readings that are Infinity, NaN, or outside [range_min, range_max].
 * - Converts surviving polar readings to Cartesian (x = r·cos θ, y = r·sin θ).
 * - Computes the maximum valid range for optional range-ring scaling.
 */
export function transformLaserScan(msg: LaserScanMessage): LidarRenderData {
  const { angle_min, angle_increment, range_min, range_max, ranges, header } =
    msg;

  const points: CartesianPoint[] = [];
  let maxRange = 0;

  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];

    // Filter invalid readings.
    if (!isFinite(r) || r < range_min || r > range_max) {
      continue;
    }

    const angle = angle_min + i * angle_increment;
    points.push({
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
    });

    if (r > maxRange) {
      maxRange = r;
    }
  }

  const timestamp = header.stamp.sec * 1000 + header.stamp.nsec / 1_000_000;

  return {
    points,
    maxRange,
    frameId: header.frame_id,
    timestamp,
    rangeMin: range_min,
    rangeMax: range_max,
  };
}

// ---------------------------------------------------------------------------
// renderLidarFrame
// ---------------------------------------------------------------------------

const BACKGROUND_COLOR = '#0a0a0f';
const RING_COLOR = 'rgba(255, 255, 255, 0.08)';
const RING_LABEL_COLOR = 'rgba(255, 255, 255, 0.3)';
const ORIGIN_COLOR = '#00ff88';
const DEFAULT_POINT_COLOR = '#00ccff';
const ORIGIN_RADIUS_PX = 4;
const SCAN_POINT_RADIUS_PX = 1.5;
const RANGE_RING_COUNT = 4;

/**
 * Renders a single LiDAR frame onto a 2D canvas context.
 *
 * Coordinate convention: canvas centre maps to the robot origin.
 * Positive X is right (forward-right in ROS laser frame), positive Y is up
 * (ROS forward) so the display is oriented naturally.
 *
 * Steps:
 * 1. clearRect + dark background fill.
 * 2. Range rings (equally spaced up to maxRange).
 * 3. Scan points projected from robot centre.
 * 4. Robot origin dot.
 */
export function renderLidarFrame(
  ctx: CanvasRenderingContext2D,
  data: LidarRenderData,
  width: number,
  height: number,
  scale: number,
  pointColor: string = DEFAULT_POINT_COLOR
): void {
  // --- 1. Clear and background ---
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  // --- 2. Range rings ---
  if (data.maxRange > 0) {
    const ringStep = data.maxRange / RANGE_RING_COUNT;
    for (let i = 1; i <= RANGE_RING_COUNT; i++) {
      const radiusPx = ringStep * i * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
      ctx.strokeStyle = RING_COLOR;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label (distance in metres)
      ctx.fillStyle = RING_LABEL_COLOR;
      ctx.fillRect(cx + radiusPx + 2, cy - 8, 0, 0); // zero-size rect to position text (no text API on mock)
    }
  }

  // --- 3. Save transform and move origin to canvas centre ---
  ctx.save();
  ctx.translate(cx, cy);

  // Draw scan points.
  // ROS laser frame: x is forward, y is left. We map x→right, y→up on canvas
  // i.e. canvas_x = point.x * scale, canvas_y = -point.y * scale
  ctx.fillStyle = pointColor;
  for (const point of data.points) {
    const px = point.x * scale;
    const py = -point.y * scale;
    ctx.beginPath();
    ctx.arc(px, py, SCAN_POINT_RADIUS_PX, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 4. Robot origin marker ---
  ctx.fillStyle = ORIGIN_COLOR;
  ctx.beginPath();
  ctx.arc(0, 0, ORIGIN_RADIUS_PX, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
