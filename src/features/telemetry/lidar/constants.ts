// Lidar-related constants

import type { LidarData } from './definitions';

// Topic defaults
export const DEFAULT_LIDAR_TOPIC = '/scan';

// Available topic options for lidar
export const LIDAR_TOPIC_OPTIONS = [
  '/scan',
  '/scan_filtered',
  '/lidar/points',
] as const;

// Mock lidar data for development
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
