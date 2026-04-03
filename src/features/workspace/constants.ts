import { Activity, Camera, Compass, Crosshair, Gamepad2, Radar, Shield } from 'lucide-react';
import type { ImuVariant } from '@/features/workspace/types/ImuPanel.types';
import type { MobileTabId } from './types/RobotWorkspaceMobile.types';

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

/** MOBILE_TAB_META
 * @description Tab metadata for the mobile workspace bottom bar. Five data
 *  panels plus a Pilot nav action. Short labels fit the narrow tab bar.
 */
export const MOBILE_TAB_META: readonly { id: MobileTabId; label: string; icon: typeof Camera }[] = [
  { id: 'camera', label: 'CAM', icon: Camera },
  { id: 'lidar', label: 'LDR', icon: Radar },
  { id: 'status', label: 'SYS', icon: Shield },
  { id: 'imu', label: 'IMU', icon: Compass },
  { id: 'telemetry', label: 'TEL', icon: Activity },
  { id: 'pilot', label: 'PILOT', icon: Crosshair },
];

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

/** TELEMETRY_TIME_WINDOW_MS
 * @description Default time window in milliseconds for the telemetry chart.
 */
export const TELEMETRY_TIME_WINDOW_MS = 30_000;

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

/** LIDAR_CANVAS_TOKEN_MAP
 * @description Maps local color keys to CSS custom property names for the
 *  LiDAR canvas panel. Used with the useCanvasColors hook.
 */
export const LIDAR_CANVAS_TOKEN_MAP = {
  accent: '--color-accent',
  border: '--color-border',
  caution: '--color-status-caution',
  critical: '--color-status-critical',
  nominal: '--color-status-nominal',
  surfaceBase: '--color-surface-base',
  textMuted: '--color-text-muted',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
} as const;

/** TELEMETRY_CANVAS_TOKEN_MAP
 * @description Maps local color keys to CSS custom property names for the
 *  telemetry chart canvas. Used with the useCanvasColors hook.
 */
export const TELEMETRY_CANVAS_TOKEN_MAP = {
  border: '--color-border',
  textMuted: '--color-text-muted',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
} as const;

/** PANEL_TOPIC_TYPES
 * @description Maps each panel ID to its compatible ROS message types.
 *  Used to filter the topic dropdown per panel.
 */
export const PANEL_TOPIC_TYPES: Record<string, readonly string[]> = {
  camera: ['sensor_msgs/msg/CompressedImage', 'sensor_msgs/msg/Image'],
  lidar: ['sensor_msgs/msg/LaserScan'],
  imu: ['sensor_msgs/msg/Imu'],
  controls: ['geometry_msgs/msg/Twist'],
  telemetry: [
    'nav_msgs/msg/Odometry',
    'geometry_msgs/msg/Twist',
    'sensor_msgs/msg/Imu',
    'sensor_msgs/msg/BatteryState',
    'sensor_msgs/msg/LaserScan',
  ],
};

/** DEFAULT_PANEL_TOPICS
 * @description Default topic name for each panel, used until the user selects
 *  a different one or auto-discovery finds a match.
 */
export const DEFAULT_PANEL_TOPICS: Record<string, string> = {
  camera: '/camera/image_raw',
  lidar: '/scan',
  imu: '/imu/data',
  controls: '/cmd_vel',
  telemetry: '/odom',
};
