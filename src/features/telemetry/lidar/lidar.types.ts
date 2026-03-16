export const LIDAR_DEFAULT_TOPIC = '/scan';
export const LIDAR_MESSAGE_TYPE = 'sensor_msgs/LaserScan';

export interface CartesianPoint {
  x: number;
  y: number;
}

export interface LidarRenderData {
  points: CartesianPoint[];
  maxRange: number;
  frameId: string;
  timestamp: number;
  rangeMin: number;
  rangeMax: number;
}
