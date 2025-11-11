/**
 * ROS Feature Type Definitions
 *
 * TypeScript interfaces and types for the ROS feature.
 * These match ROS2 message definitions for use with rosbridge_suite.
 */

import type ROSLIB from 'roslib';

// Re-export ROSLIB type for convenience
export type { ROSLIB };

// ============================================================================
// Connection Types
// ============================================================================

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface RobotConnection {
  id: string;
  name: string;
  url: string;
  addedAt: number;
}

// ============================================================================
// ROS Message Types
// ============================================================================

// Common ROS types
export interface ROSHeader {
  seq: number;
  stamp: {
    secs: number;
    nsecs: number;
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

// geometry_msgs/msg/Twist - for cmd_vel control
export interface TwistMessage {
  linear: Vector3;
  angular: Vector3;
}

// sensor_msgs/msg/Imu - for IMU telemetry
export interface ImuMessage {
  header: ROSHeader;
  orientation: Quaternion;
  orientation_covariance: number[]; // 9 elements
  angular_velocity: Vector3;
  angular_velocity_covariance: number[]; // 9 elements
  linear_acceleration: Vector3;
  linear_acceleration_covariance: number[]; // 9 elements
}

// sensor_msgs/msg/LaserScan - for LIDAR telemetry
export interface LaserScanMessage {
  header: ROSHeader;
  angle_min: number; // Start angle (rad)
  angle_max: number; // End angle (rad)
  angle_increment: number; // Angular distance between measurements (rad)
  time_increment: number; // Time between measurements (sec)
  scan_time: number; // Time between scans (sec)
  range_min: number; // Minimum range value (m)
  range_max: number; // Maximum range value (m)
  ranges: number[]; // Range data (m)
  intensities: number[]; // Intensity data
}

// nav_msgs/msg/Odometry - for position/velocity
export interface OdometryMessage {
  header: ROSHeader;
  child_frame_id: string;
  pose: {
    pose: {
      position: Vector3;
      orientation: Quaternion;
    };
    covariance: number[]; // 36 elements
  };
  twist: {
    twist: TwistMessage;
    covariance: number[]; // 36 elements
  };
}

// sensor_msgs/msg/BatteryState - for battery telemetry
export interface BatteryStateMessage {
  header: ROSHeader;
  voltage: number; // Voltage (V)
  temperature: number; // Temperature (°C)
  current: number; // Current (A)
  charge: number; // Current charge (Ah)
  capacity: number; // Capacity (Ah)
  design_capacity: number; // Design capacity (Ah)
  percentage: number; // Charge percentage (0-1)
  power_supply_status: number; // Status constant
  power_supply_health: number; // Health constant
  power_supply_technology: number; // Technology constant
  present: boolean; // Is present
  cell_voltage: number[]; // Individual cell voltages
  cell_temperature: number[]; // Individual cell temps
  location: string; // Physical location
  serial_number: string; // Serial number
}

// ============================================================================
// Topic Types
// ============================================================================

export interface TopicInfo {
  name: string;
  type: string;
}

export interface TopicConfig {
  name: string;
  messageType: string;
  throttle_rate?: number;
  queue_size?: number;
}

// ============================================================================
// Hook Configuration Types
// ============================================================================

export interface UsePublisherConfig {
  topic: string;
  messageType: string;
  queueSize?: number;
}

export interface UseSubscriberConfig {
  topic: string;
  messageType: string;
  throttleRate?: number;
  enabled?: boolean;
}
