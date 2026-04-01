import type { ImuVariant } from '@/features/workspace/types/ImuPanel.types';

export const IMU_VIZ_OPTIONS: readonly { value: ImuVariant; label: string; shortLabel: string }[] =
  [
    { value: 'attitude-compass', label: 'Attitude + Compass', shortLabel: 'ATT+CMP' },
    { value: 'numbers', label: 'Numbers Only', shortLabel: 'NUM' },
    { value: 'attitude', label: 'Attitude Indicator', shortLabel: 'ATT' },
    { value: '3d', label: '3D Wireframe', shortLabel: '3D' },
  ];

export const COMPASS_CARDINALS = [
  { label: 'N', deg: 0 },
  { label: 'E', deg: 90 },
  { label: 'S', deg: 180 },
  { label: 'W', deg: 270 },
] as const;

export const PITCH_LADDER_DEGREES = [-20, -10, 10, 20] as const;

/** LIDAR_ZOOM_MIN
 * @description Minimum zoom level for LiDAR panel.
 */
export const LIDAR_ZOOM_MIN = 0.5;

/** LIDAR_ZOOM_MAX
 * @description Maximum zoom level for LiDAR panel.
 */
export const LIDAR_ZOOM_MAX = 4;

/** LIDAR_ZOOM_STEP
 * @description Zoom increment per mouse wheel tick.
 */
export const LIDAR_ZOOM_STEP = 0.2;

/** LIDAR_GRID_LINE_COUNT
 * @description Number of grid divisions on each axis.
 */
export const LIDAR_GRID_LINE_COUNT = 8;

/** LIDAR_POINT_RADIUS
 * @description Radius in pixels for each LiDAR scan point.
 */
export const LIDAR_POINT_RADIUS = 2;

/** LIDAR_ROBOT_SIZE
 * @description Size in pixels for the robot triangle indicator.
 */
export const LIDAR_ROBOT_SIZE = 10;

import { Activity, Camera, Compass, Gamepad2, Radar, Shield } from 'lucide-react';

/** WORKSPACE_PANEL_META
 * @description Panel metadata for dock bar restore buttons and minimize hook.
 */

export const WORKSPACE_PANEL_META = [
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'lidar', label: 'LiDAR', icon: Radar },
  { id: 'status', label: 'Status', icon: Shield },
  { id: 'imu', label: 'IMU', icon: Compass },
  { id: 'controls', label: 'Controls', icon: Gamepad2 },
  { id: 'telemetry', label: 'Telemetry', icon: Activity },
] as const;

/** WORKSPACE_PANEL_IDS
 * @description Array of all panel IDs for minimize/maximize hook.
 */
export const WORKSPACE_PANEL_IDS = WORKSPACE_PANEL_META.map((p) => p.id);

/** GRID_COL_MAP
 * @description Maps visible panel count to Tailwind grid-cols class.
 *  Static class names to survive Tailwind purging.
 */
export const GRID_COL_MAP: Record<number, string> = {
  0: 'grid-cols-1',
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

/** TELEMETRY_GRID_LINES_H
 * @description Number of horizontal grid lines in the telemetry chart.
 */
export const TELEMETRY_GRID_LINES_H = 4;

/** TELEMETRY_GRID_LINES_V
 * @description Number of vertical grid lines in the telemetry chart.
 */
export const TELEMETRY_GRID_LINES_V = 6;

/** TELEMETRY_LINE_WIDTH
 * @description Stroke width for telemetry series lines.
 */
export const TELEMETRY_LINE_WIDTH = 1.5;

/** TELEMETRY_AXIS_PADDING
 * @description Left padding in pixels for value axis labels.
 */
export const TELEMETRY_AXIS_PADDING = 40;

/** TELEMETRY_BOTTOM_PADDING
 * @description Bottom padding in pixels for time axis labels.
 */
export const TELEMETRY_BOTTOM_PADDING = 20;
