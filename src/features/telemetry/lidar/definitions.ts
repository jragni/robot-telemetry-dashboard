// Lidar-related type definitions

export interface LidarPoint {
  angle: number;
  distance: number;
  intensity?: number;
}

export interface LidarData {
  ranges: number[];
  angleMin: number;
  angleMax: number;
  angleIncrement: number;
  rangeMin: number;
  rangeMax: number;
}

export interface LidarCardProps {
  compact?: boolean;
}
