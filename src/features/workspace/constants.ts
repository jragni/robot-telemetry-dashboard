import {
  Activity,
  Camera,
  Compass,
  Gamepad2,
  Radar,
  Shield,
} from 'lucide-react';

export const WORKSPACE_PANELS = [
  {
    id: 'camera',
    label: 'Camera',
    icon: Camera,
    topicName: '/camera/image_raw',
  },
  { id: 'lidar', label: 'LiDAR', icon: Radar, topicName: '/scan' },
  { id: 'status', label: 'System Status', icon: Shield },
  { id: 'imu', label: 'IMU Attitude', icon: Compass, topicName: '/imu/data' },
  { id: 'controls', label: 'Controls', icon: Gamepad2, topicName: '/cmd_vel' },
  { id: 'telemetry', label: 'Telemetry', icon: Activity, topicName: '/odom' },
] satisfies readonly {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  topicName?: string;
}[];

export type ImuVariant = 'attitude-compass' | 'numbers' | 'attitude' | '3d';

export const IMU_VIZ_OPTIONS: readonly { value: ImuVariant; label: string }[] =
  [
    { value: 'attitude-compass', label: 'Attitude + Compass' },
    { value: 'numbers', label: 'Numbers Only' },
    { value: 'attitude', label: 'Attitude Indicator' },
    { value: '3d', label: '3D Wireframe' },
  ];

export const COMPASS_CARDINALS = [
  { label: 'N', deg: 0 },
  { label: 'E', deg: 90 },
  { label: 'S', deg: 180 },
  { label: 'W', deg: 270 },
] as const;

export const PITCH_LADDER_DEGREES = [-20, -10, 10, 20] as const;

export const DPAD_BTN =
  'w-8 h-8 bg-surface-tertiary border border-border rounded-sm font-mono text-xs flex items-center justify-center cursor-pointer hover:border-border-hover transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none';
