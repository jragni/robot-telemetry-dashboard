// LIDAR types and interfaces

import type { LaserScanMessage } from '@/contexts/ros/definitions';

export interface LidarPoint {
  x: number;
  y: number;
  color: string;
}

export interface LidarPointsProps {
  lidarData: LaserScanMessage;
  viewRange: number;
}
