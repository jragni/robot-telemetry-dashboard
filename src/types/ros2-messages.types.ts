import type { ROSHeader, Vector3, Quaternion } from './ros2-primitives.types';

// geometry_msgs/msg/Twist
export interface TwistMessage {
  readonly linear: Vector3;
  readonly angular: Vector3;
}

// sensor_msgs/msg/Imu
export interface ImuMessage {
  readonly header: ROSHeader;
  readonly orientation: Quaternion;
  readonly orientation_covariance: readonly number[];
  readonly angular_velocity: Vector3;
  readonly angular_velocity_covariance: readonly number[];
  readonly linear_acceleration: Vector3;
  readonly linear_acceleration_covariance: readonly number[];
}

// sensor_msgs/msg/LaserScan
export interface LaserScanMessage {
  readonly header: ROSHeader;
  readonly angle_min: number;
  readonly angle_max: number;
  readonly angle_increment: number;
  readonly time_increment: number;
  readonly scan_time: number;
  readonly range_min: number;
  readonly range_max: number;
  readonly ranges: readonly number[];
  readonly intensities: readonly number[];
}

// nav_msgs/msg/Odometry
export interface OdometryMessage {
  readonly header: ROSHeader;
  readonly child_frame_id: string;
  readonly pose: {
    readonly pose: {
      readonly position: Vector3;
      readonly orientation: Quaternion;
    };
    readonly covariance: readonly number[];
  };
  readonly twist: {
    readonly twist: TwistMessage;
    readonly covariance: readonly number[];
  };
}

// sensor_msgs/msg/BatteryState
export interface BatteryStateMessage {
  readonly header: ROSHeader;
  readonly voltage: number;
  readonly temperature: number;
  readonly current: number;
  readonly charge: number;
  readonly capacity: number;
  readonly design_capacity: number;
  readonly percentage: number;
  readonly power_supply_status: number;
  readonly power_supply_health: number;
  readonly power_supply_technology: number;
  readonly present: boolean;
  readonly cell_voltage: readonly number[];
  readonly cell_temperature: readonly number[];
  readonly location: string;
  readonly serial_number: string;
}
