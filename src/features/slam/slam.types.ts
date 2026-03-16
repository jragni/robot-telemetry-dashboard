export const MAP_DEFAULT_TOPIC = '/map';
export const MAP_MESSAGE_TYPE = 'nav_msgs/OccupancyGrid';
export const ODOM_DEFAULT_TOPIC = '/odom';
export const ODOM_MESSAGE_TYPE = 'nav_msgs/Odometry';

// ---------------------------------------------------------------------------
// Grid cell
// ---------------------------------------------------------------------------

export interface GridCell {
  x: number; // grid column
  y: number; // grid row
  value: number; // -1=unknown, 0=free, 100=occupied
}

// ---------------------------------------------------------------------------
// ParsedOccupancyGrid
// ---------------------------------------------------------------------------

export interface ParsedOccupancyGrid {
  width: number;
  height: number;
  resolution: number; // meters per cell
  originX: number; // world X of grid cell (0,0)
  originY: number; // world Y of grid cell (0,0)
  cells: Int8Array; // raw grid data, row-major
  timestamp: number;
}

// ---------------------------------------------------------------------------
// RobotPosition
// ---------------------------------------------------------------------------

export interface RobotPosition {
  x: number; // world meters
  y: number; // world meters
  heading: number; // radians
}

// ---------------------------------------------------------------------------
// d3-zoom compatible transform (mirrors d3.ZoomTransform shape)
// ---------------------------------------------------------------------------

export interface ZoomTransform {
  k: number; // scale factor
  x: number; // x translation (canvas pixels)
  y: number; // y translation (canvas pixels)
}
