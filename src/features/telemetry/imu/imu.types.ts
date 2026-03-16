// ---------------------------------------------------------------------------
// Topic constants
// ---------------------------------------------------------------------------

export const IMU_DEFAULT_TOPIC = '/imu/data';
export const IMU_MESSAGE_TYPE = 'sensor_msgs/Imu';

// ---------------------------------------------------------------------------
// Derived data produced by transformImuMessage
// ---------------------------------------------------------------------------

export interface ImuDerivedData {
  // Euler angles in degrees (ZYX convention)
  roll: number;
  pitch: number;
  yaw: number;

  // Linear acceleration (m/s²)
  accelX: number;
  accelY: number;
  accelZ: number;
  accelMagnitude: number;

  // Angular velocity (rad/s)
  angularVelX: number;
  angularVelY: number;
  angularVelZ: number;
  angularVelMagnitude: number;

  // Timestamp derived from header.stamp (seconds as float)
  timestamp: number;
}

// ---------------------------------------------------------------------------
// View mode toggle
// ---------------------------------------------------------------------------

export type ImuViewMode = 'digital' | 'plot';
