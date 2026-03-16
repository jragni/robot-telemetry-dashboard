import type {
  ParsedOccupancyGrid,
  RobotPosition,
  ZoomTransform,
} from './slam.types';

import type { OccupancyGridMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// parseOccupancyGrid
// ---------------------------------------------------------------------------

/**
 * Deserialises a ROS nav_msgs/OccupancyGrid message into a
 * {@link ParsedOccupancyGrid} that is ready for canvas rendering.
 *
 * The raw `data` number array is copied into an Int8Array so that the
 * -1 (unknown) encoding is preserved without unsigned-truncation.
 */
export function parseOccupancyGrid(
  msg: OccupancyGridMessage
): ParsedOccupancyGrid {
  const { info, data, header } = msg;

  const cells = new Int8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    cells[i] = data[i];
  }

  const timestamp = header.stamp.sec * 1000 + header.stamp.nsec / 1_000_000;

  return {
    width: info.width,
    height: info.height,
    resolution: info.resolution,
    originX: info.origin.position.x,
    originY: info.origin.position.y,
    cells,
    timestamp,
  };
}

// ---------------------------------------------------------------------------
// cellToColor
// ---------------------------------------------------------------------------

// Color constants (RGB tuples)
const COLOR_UNKNOWN: [number, number, number] = [40, 40, 50]; // dark gray-blue
const COLOR_FREE: [number, number, number] = [15, 20, 30]; // near-black
const COLOR_OCCUPIED: [number, number, number] = [200, 210, 230]; // light walls

/**
 * Maps an OccupancyGrid cell value to an RGB colour tuple.
 *
 * - `-1` (unknown)  → dark gray-blue
 * -  `0` (free)     → near-black (matches dark background)
 * - `100` (occupied) → light (visible wall/obstacle)
 * - Intermediate values (0–100) are linearly interpolated between free and
 *   occupied.
 */
export function cellToColor(value: number): [number, number, number] {
  // Unknown cells: value < 0
  if (value < 0) {
    return [...COLOR_UNKNOWN] as [number, number, number];
  }

  // Clamp to [0, 100]
  const clamped = Math.min(100, Math.max(0, value));

  const t = clamped / 100;

  const r = Math.round(COLOR_FREE[0] + t * (COLOR_OCCUPIED[0] - COLOR_FREE[0]));
  const g = Math.round(COLOR_FREE[1] + t * (COLOR_OCCUPIED[1] - COLOR_FREE[1]));
  const b = Math.round(COLOR_FREE[2] + t * (COLOR_OCCUPIED[2] - COLOR_FREE[2]));

  return [r, g, b];
}

// ---------------------------------------------------------------------------
// renderOccupancyGrid
// ---------------------------------------------------------------------------

/**
 * Renders an {@link ParsedOccupancyGrid} onto a 2D canvas context.
 *
 * Strategy:
 * 1. Create an ImageData sized to the grid dimensions (one pixel per cell).
 * 2. Fill each pixel using {@link cellToColor} for the corresponding cell.
 * 3. Apply the d3-zoom transform (translate + scale) via canvas ctx.setTransform,
 *    then put the image data so that pan/zoom is respected without re-creating
 *    the image on every frame.
 */
export function renderOccupancyGrid(
  ctx: CanvasRenderingContext2D,
  grid: ParsedOccupancyGrid,
  canvasWidth: number,
  canvasHeight: number,
  transform: ZoomTransform
): void {
  // --- Clear canvas ---
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // --- Build ImageData (1px per grid cell) ---
  const imageData = ctx.createImageData(grid.width, grid.height);
  const pixels = imageData.data;

  for (let row = 0; row < grid.height; row++) {
    for (let col = 0; col < grid.width; col++) {
      // OccupancyGrid rows start at the bottom in ROS (Y-up world frame).
      // To render correctly on a canvas (Y-down), flip vertically.
      const gridIdx = (grid.height - 1 - row) * grid.width + col;
      const cellValue = grid.cells[gridIdx] ?? -1;
      const [r, g, b] = cellToColor(cellValue);

      const pixelIdx = (row * grid.width + col) * 4;
      pixels[pixelIdx] = r;
      pixels[pixelIdx + 1] = g;
      pixels[pixelIdx + 2] = b;
      pixels[pixelIdx + 3] = 255;
    }
  }

  // --- Apply d3-zoom transform and draw ---
  ctx.save();
  ctx.setTransform(transform.k, 0, 0, transform.k, transform.x, transform.y);
  ctx.putImageData(imageData, 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// worldToGrid
// ---------------------------------------------------------------------------

/**
 * Converts world-frame coordinates (metres) to grid cell coordinates.
 *
 * The OccupancyGrid origin marks the world position of cell (col=0, row=0).
 * Dividing the world offset by the resolution gives the fractional cell index,
 * which is floored to an integer column/row.
 */
export function worldToGrid(
  worldX: number,
  worldY: number,
  grid: ParsedOccupancyGrid
): { col: number; row: number } {
  const col = Math.floor((worldX - grid.originX) / grid.resolution);
  const row = Math.floor((worldY - grid.originY) / grid.resolution);
  return { col, row };
}

// ---------------------------------------------------------------------------
// gridToCanvas
// ---------------------------------------------------------------------------

/**
 * Converts grid cell coordinates to canvas pixel coordinates, accounting for
 * a d3-zoom transform.
 *
 * Applies the Y-flip used by {@link renderOccupancyGrid} so that the robot
 * marker aligns with the rendered grid.
 */
export function gridToCanvas(
  col: number,
  row: number,
  grid: ParsedOccupancyGrid,
  transform: ZoomTransform
): { px: number; py: number } {
  // Flip row to match the Y-flip in renderOccupancyGrid
  const flippedRow = grid.height - 1 - row;

  const px = transform.x + col * transform.k;
  const py = transform.y + flippedRow * transform.k;

  return { px, py };
}

// ---------------------------------------------------------------------------
// renderRobotMarker
// ---------------------------------------------------------------------------

const ROBOT_MARKER_SIZE_PX = 8; // half-size of the triangle in grid pixels
const ROBOT_MARKER_COLOR = '#00ff88';
const ROBOT_MARKER_OUTLINE_COLOR = 'rgba(0,0,0,0.6)';

/**
 * Draws a directional triangle at the robot's world position.
 *
 * The triangle points in the direction of `position.heading` and is sized
 * relative to the current zoom scale so it remains a consistent visual size
 * on screen regardless of zoom level.
 */
export function renderRobotMarker(
  ctx: CanvasRenderingContext2D,
  position: RobotPosition,
  grid: ParsedOccupancyGrid,
  transform: ZoomTransform
): void {
  const { col, row } = worldToGrid(position.x, position.y, grid);
  const { px, py } = gridToCanvas(col, row, grid, transform);

  // Scale marker so it stays a constant screen size (~16px) regardless of zoom
  const markerSize = ROBOT_MARKER_SIZE_PX / Math.max(transform.k, 0.1);

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-position.heading); // negative because canvas Y is inverted

  // Draw triangle pointing "up" (forward direction)
  ctx.beginPath();
  ctx.moveTo(0, -markerSize * 1.5); // tip (forward)
  ctx.lineTo(-markerSize, markerSize); // left base
  ctx.lineTo(markerSize, markerSize); // right base
  ctx.closePath();

  // Outline
  ctx.strokeStyle = ROBOT_MARKER_OUTLINE_COLOR;
  ctx.lineWidth = 2 / transform.k;
  ctx.stroke();

  // Fill
  ctx.fillStyle = ROBOT_MARKER_COLOR;
  ctx.fill();

  ctx.restore();
}
