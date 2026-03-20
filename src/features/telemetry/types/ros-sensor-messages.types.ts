export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ImuMessage {
  orientation: Quaternion;
  orientation_covariance?: number[];
  angular_velocity: Vector3 | null;
  angular_velocity_covariance?: number[];
  linear_acceleration: Vector3 | null;
  linear_acceleration_covariance?: number[];
}

export interface LaserScanMessage {
  angle_min: number;
  angle_max: number;
  angle_increment: number;
  time_increment: number;
  scan_time: number;
  range_min: number;
  range_max: number;
  ranges: number[];
  intensities: number[];
}

export interface CompressedImageMessage {
  format: string;
  data: string; // base64-encoded
}
