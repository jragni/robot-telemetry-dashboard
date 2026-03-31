/**
 * ROS2 Message Types
 * @description Full ROS2 message interfaces matching rosbridge_suite wire format.
 *  Ported from EPIC/refactor-for-quality-of-life branch. These are the raw shapes
 *  that roslib delivers; panel components consume normalized versions instead.
 */

import type { ROSHeader, Vector3, Quaternion } from './ros2-primitives.types';

/** TwistMessage
 * @description geometry_msgs/msg/Twist — linear and angular velocity.
 */
export interface TwistMessage {
  readonly linear: Vector3;
  readonly angular: Vector3;
}

/** ImuMessage
 * @description sensor_msgs/msg/Imu — orientation, angular velocity,
 *  and linear acceleration with covariance.
 */
export interface ImuMessage {
  readonly header: ROSHeader;
  readonly orientation: Quaternion;
  readonly orientation_covariance: readonly number[];
  readonly angular_velocity: Vector3;
  readonly angular_velocity_covariance: readonly number[];
  readonly linear_acceleration: Vector3;
  readonly linear_acceleration_covariance: readonly number[];
}

/** LaserScanMessage
 * @description sensor_msgs/msg/LaserScan — planar laser range-finder data.
 */
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

/** OdometryMessage
 * @description nav_msgs/msg/Odometry — position and velocity estimate.
 */
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

/** BatteryStateMessage
 * @description sensor_msgs/msg/BatteryState — battery telemetry.
 */
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
