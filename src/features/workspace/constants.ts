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

/** KEY_TO_DIRECTION
 * @description Maps keyboard keys to robot movement directions for D-pad
 *  keyboard control.
 */
export const KEY_TO_DIRECTION: Record<string, 'forward' | 'backward' | 'left' | 'right'> = {
  ArrowUp: 'forward',
  ArrowDown: 'backward',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** DPAD_BTN
 * @description Styling overrides for D-pad directional control buttons.
 */
export const DPAD_BTN =
  'w-10 h-10 bg-surface-tertiary border border-border rounded-sm font-mono text-xs text-text-muted hover:border-border-hover cursor-pointer transition-all duration-200 select-none';

/** DPAD_BTN_ACTIVE
 * @description Additional styling when a D-pad button is actively pressed.
 */
export const DPAD_BTN_ACTIVE = 'bg-accent-subtle text-accent border-accent';

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

/** VELOCITY_LIMITS
 * @description Default velocity ranges for robot control. Matches ROS2 cmd_vel
 *  conventions from EPIC/refactor-for-quality-of-life.
 */
export const VELOCITY_LIMITS = {
  linear: { min: 0, max: 1.0, default: 0.15 },
  angular: { min: 0, max: 2.0, default: 0.39 },
} as const;
