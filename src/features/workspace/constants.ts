import type { ComponentType } from 'react';
import { Activity, Camera, Compass, Crosshair, Gamepad2, Radar, Shield } from 'lucide-react';

import { CANVAS_FALLBACKS } from '@/utils/canvasColors';
import type { ImuVariant } from '@/features/workspace/types/ImuPanel.types';

import { CameraPanel } from './components/CameraPanel';
import { ImuPanel } from './components/ImuPanel/ImuPanel';
import { LidarPanel } from './components/LidarPanel/LidarPanel';
import { SystemStatusPanel } from './components/SystemStatusPanel/SystemStatusPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import type { MobileDataPanelId, MobileTabId } from './types/RobotWorkspaceMobile.types';

export const IMU_VIZ_OPTIONS: readonly { label: string; shortLabel: string; value: ImuVariant }[] =
  [
    { label: 'Attitude + Compass', shortLabel: 'ATT+CMP', value: 'attitude-compass' },
    { label: 'Numbers Only', shortLabel: 'NUM', value: 'numbers' },
    { label: 'Attitude Indicator', shortLabel: 'ATT', value: 'attitude' },
    { label: '3D Wireframe', shortLabel: '3D', value: '3d' },
  ];

export const PITCH_LADDER_DEGREES = [-20, -10, 10, 20] as const;

export const LIDAR_ZOOM_MIN = 0.5;

export const LIDAR_ZOOM_MAX = 4;

export const LIDAR_ZOOM_STEP = 0.2;

export const LIDAR_GRID_LINE_COUNT = 8;

export const LIDAR_ROBOT_SIZE = 10;

export const WORKSPACE_PANEL_META = [
  { icon: Camera, id: 'camera', label: 'Camera' },
  { icon: Radar, id: 'lidar', label: 'LiDAR' },
  { icon: Shield, id: 'status', label: 'Status' },
  { icon: Compass, id: 'imu', label: 'IMU' },
  { icon: Gamepad2, id: 'controls', label: 'Controls' },
  { icon: Activity, id: 'telemetry', label: 'Telemetry' },
] as const;

export const WORKSPACE_PANEL_IDS = WORKSPACE_PANEL_META.map((p) => p.id);

export const MOBILE_TAB_META: readonly { icon: typeof Camera; id: MobileTabId; label: string }[] = [
  { icon: Camera, id: 'camera', label: 'CAM' },
  { icon: Radar, id: 'lidar', label: 'LDR' },
  { icon: Shield, id: 'status', label: 'SYS' },
  { icon: Compass, id: 'imu', label: 'IMU' },
  { icon: Activity, id: 'telemetry', label: 'TEL' },
  { icon: Crosshair, id: 'pilot', label: 'PILOT' },
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

export const PANEL_TOPIC_TYPES: Record<string, readonly string[]> = {
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

export { DEFAULT_PANEL_TOPICS } from '@/constants/panelTopics';

export const MOBILE_PANEL_COMPONENTS: Record<MobileDataPanelId, ComponentType<object>> = {
  camera: CameraPanel as ComponentType<object>,
  imu: ImuPanel as ComponentType<object>,
  lidar: LidarPanel as ComponentType<object>,
  status: SystemStatusPanel as ComponentType<object>,
  telemetry: TelemetryPanel as ComponentType<object>,
};

export const TELEMETRY_TOKEN_MAP: Record<string, string> = {
  border: '--color-border',
  textMuted: '--color-text-muted',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
};

export const TELEMETRY_COLOR_FALLBACKS = {
  border: CANVAS_FALLBACKS.border,
  textMuted: CANVAS_FALLBACKS.textMuted,
  textPrimary: CANVAS_FALLBACKS.textPrimary,
  textSecondary: CANVAS_FALLBACKS.textSecondary,
};

export const WORKSPACE_LIDAR_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  border: '--color-border',
  caution: '--color-status-caution',
  critical: '--color-status-critical',
  nominal: '--color-status-nominal',
  surfaceBase: '--color-surface-base',
  textMuted: '--color-text-muted',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
};

export const WORKSPACE_LIDAR_COLOR_FALLBACKS = {
  accent: CANVAS_FALLBACKS.accent,
  border: CANVAS_FALLBACKS.border,
  caution: CANVAS_FALLBACKS.statusCaution,
  critical: CANVAS_FALLBACKS.statusCritical,
  nominal: CANVAS_FALLBACKS.statusNominal,
  surfaceBase: CANVAS_FALLBACKS.surfaceBase,
  textMuted: CANVAS_FALLBACKS.textMuted,
  textPrimary: CANVAS_FALLBACKS.textPrimary,
  textSecondary: CANVAS_FALLBACKS.textSecondary,
};

export const COMPASS_HEADING_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  border: '--color-border',
  muted: '--color-text-muted',
  primary: '--color-text-primary',
};

export const COMPASS_HEADING_COLOR_FALLBACKS = {
  accent: CANVAS_FALLBACKS.accent,
  border: CANVAS_FALLBACKS.border,
  muted: CANVAS_FALLBACKS.textMuted,
  primary: CANVAS_FALLBACKS.textPrimary,
};

export const WIREFRAME_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  border: '--color-border',
  muted: '--color-text-muted',
};

export const WIREFRAME_COLOR_FALLBACKS = {
  accent: CANVAS_FALLBACKS.accent,
  border: CANVAS_FALLBACKS.border,
  muted: CANVAS_FALLBACKS.textMuted,
};

export const ATTITUDE_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  border: '--color-border',
  ground: '--color-imu-ground',
  sky: '--color-imu-sky',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
};

export const ATTITUDE_COLOR_FALLBACKS = {
  accent: CANVAS_FALLBACKS.accent,
  border: CANVAS_FALLBACKS.border,
  ground: CANVAS_FALLBACKS.imuGround,
  sky: CANVAS_FALLBACKS.imuSky,
  textPrimary: CANVAS_FALLBACKS.textPrimary,
  textSecondary: CANVAS_FALLBACKS.textSecondary,
};
