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
