import { Activity, Camera, Compass, Crosshair, Gamepad2, Radar, Shield } from 'lucide-react';

import type { ImuVariant } from '@/features/workspace/types/ImuPanel.types';

import type { MobileTabId } from './types/RobotWorkspaceMobile.types';
import type { PanelId } from './types/panel.types';

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

export const LIDAR_ZOOM_MIN = 0.5;

export const LIDAR_ZOOM_MAX = 4;

export const LIDAR_ZOOM_STEP = 0.2;

export const LIDAR_GRID_LINE_COUNT = 8;

export const LIDAR_POINT_RADIUS = 2;

export const LIDAR_ROBOT_SIZE = 10;

export const WORKSPACE_PANEL_META = [
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'lidar', label: 'LiDAR', icon: Radar },
  { id: 'status', label: 'Status', icon: Shield },
  { id: 'imu', label: 'IMU', icon: Compass },
  { id: 'controls', label: 'Controls', icon: Gamepad2 },
  { id: 'telemetry', label: 'Telemetry', icon: Activity },
] as const;

export const WORKSPACE_PANEL_IDS = WORKSPACE_PANEL_META.map((p) => p.id);

export const MOBILE_TAB_META: readonly { id: MobileTabId; label: string; icon: typeof Camera }[] = [
  { id: 'camera', label: 'CAM', icon: Camera },
  { id: 'lidar', label: 'LDR', icon: Radar },
  { id: 'status', label: 'SYS', icon: Shield },
  { id: 'imu', label: 'IMU', icon: Compass },
  { id: 'telemetry', label: 'TEL', icon: Activity },
  { id: 'pilot', label: 'PILOT', icon: Crosshair },
];

// Static class names to survive Tailwind purging
export const GRID_COL_MAP: Record<number, string> = {
  0: 'grid-cols-1',
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

export const TELEMETRY_GRID_LINES_H = 4;

export const TELEMETRY_GRID_LINES_V = 6;

export const TELEMETRY_TIME_WINDOW_MS = 30_000;

export const TELEMETRY_LINE_WIDTH = 1.5;

export const TELEMETRY_AXIS_PADDING = 40;

export const TELEMETRY_BOTTOM_PADDING = 20;

/** PANEL_TOPIC_TYPES
 * @description Maps each panel ID to its compatible ROS message types.
 *  Used to filter the topic dropdown per panel.
 */
export const PANEL_TOPIC_TYPES: Partial<Record<PanelId, readonly string[]>> = {
  camera: ['sensor_msgs/msg/CompressedImage', 'sensor_msgs/msg/Image'],
  controls: ['geometry_msgs/msg/Twist'],
  imu: ['sensor_msgs/msg/Imu'],
  lidar: ['sensor_msgs/msg/LaserScan'],
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
export const DEFAULT_PANEL_TOPICS: Partial<Record<PanelId, string>> = {
  camera: '/camera/image_raw',
  controls: '/cmd_vel',
  imu: '/imu/data',
  lidar: '/scan',
  telemetry: '/odom',
};
