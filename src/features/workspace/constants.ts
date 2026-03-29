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
