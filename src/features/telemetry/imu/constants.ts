// IMU-related constants

import type { IMUData } from './definitions';

// Topic defaults
export const DEFAULT_PLOT_TOPIC = '/imu/data';

// Available topic options for IMU plotting
export const PLOT_TOPIC_OPTIONS = [
  '/imu/data',
  '/odom',
  '/joint_states',
] as const;

// Mock IMU data for development
export const MOCK_IMU: IMUData = {
  orientation: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
  angularVelocity: { x: 0.01, y: -0.02, z: 0.15 },
  linearAcceleration: { x: 0.5, y: 0.2, z: 9.81 },
};
