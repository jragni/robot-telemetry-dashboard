export interface ROSHeader {
  stamp: {
    sec: number;
    nsec: number;
  };
  frame_id: string;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Twist {
  linear: Vector3;
  angular: Vector3;
}

export interface TwistMessage {
  twist: Twist;
}

export interface ImuMessage {
  header: ROSHeader;
  orientation: Quaternion;
  angular_velocity: Vector3;
  linear_acceleration: Vector3;
}

export interface LaserScanMessage {
  header: ROSHeader;
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

export interface OdometryPose {
  position: Vector3;
  orientation: Quaternion;
}

export interface OdometryMessage {
  header: ROSHeader;
  child_frame_id: string;
  pose: {
    pose: OdometryPose;
    covariance: number[];
  };
  twist: {
    twist: Twist;
    covariance: number[];
  };
}

export interface BatteryStateMessage {
  header: ROSHeader;
  voltage: number;
  percentage: number;
  power_supply_status: number;
}

export interface MapMetaData {
  resolution: number;
  width: number;
  height: number;
  origin: {
    position: Vector3;
    orientation: Quaternion;
  };
}

export interface OccupancyGridMessage {
  header: ROSHeader;
  info: MapMetaData;
  data: number[];
}

export interface CompressedImageMessage {
  header: ROSHeader;
  format: string;
  data: string;
}

export interface TopicInfo {
  name: string;
  messageType: string;
}
