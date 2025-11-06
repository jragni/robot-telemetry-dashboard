// Telemetry section constants

import type { IMUData, LidarData } from './definitions';

// Topic defaults
export const DEFAULT_LIDAR_TOPIC = '/scan';
export const DEFAULT_PLOT_TOPIC = '/imu/data';

// Available topic options
export const LIDAR_TOPIC_OPTIONS = [
  '/scan',
  '/scan_filtered',
  '/lidar/points',
] as const;

export const PLOT_TOPIC_OPTIONS = [
  '/imu/data',
  '/odom',
  '/joint_states',
] as const;

// Mock data for development
export const MOCK_IMU: IMUData = {
  orientation: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
  angularVelocity: { x: 0.01, y: -0.02, z: 0.15 },
  linearAcceleration: { x: 0.5, y: 0.2, z: 9.81 },
};

export const MOCK_LIDAR: LidarData = {
  ranges: Array.from({ length: 360 }, (_, i) => {
    const angle = (i * Math.PI) / 180;
    return 2 + Math.sin(angle * 3) * 0.5 + Math.random() * 0.3;
  }),
  angleMin: 0,
  angleMax: 2 * Math.PI,
  angleIncrement: (2 * Math.PI) / 360,
  rangeMin: 0.1,
  rangeMax: 10.0,
};

export const MOCK_TOPICS = [
  {
    name: '/camera/image_raw',
    type: 'sensor_msgs/Image',
    rate: 30,
    active: true,
  },
  { name: '/scan', type: 'sensor_msgs/LaserScan', rate: 10, active: true },
  { name: '/imu/data', type: 'sensor_msgs/Imu', rate: 100, active: true },
  { name: '/odom', type: 'nav_msgs/Odometry', rate: 50, active: true },
  { name: '/cmd_vel', type: 'geometry_msgs/Twist', rate: 10, active: false },
  {
    name: '/joint_states',
    type: 'sensor_msgs/JointState',
    rate: 50,
    active: true,
  },
  {
    name: '/battery_state',
    type: 'sensor_msgs/BatteryState',
    rate: 1,
    active: true,
  },
  {
    name: '/diagnostics',
    type: 'diagnostic_msgs/DiagnosticArray',
    rate: 1,
    active: true,
  },
  { name: '/map', type: 'nav_msgs/OccupancyGrid', rate: 0.1, active: false },
  { name: '/tf', type: 'tf2_msgs/TFMessage', rate: 100, active: true },
];
