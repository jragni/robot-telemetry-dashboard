import type { ImuDerivedData } from './imu.types';

import type { ImuMessage, Quaternion } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// quaternionToEuler
// ---------------------------------------------------------------------------

/**
 * Converts a unit quaternion to ZYX Euler angles (roll, pitch, yaw) in
 * degrees.
 *
 * Convention: aerospace / ROS standard
 *   roll  = rotation about X (phi)
 *   pitch = rotation about Y (theta)
 *   yaw   = rotation about Z (psi)
 *
 * The derivation uses the standard ZYX sequence:
 *   R = Rz(yaw) * Ry(pitch) * Rx(roll)
 */
export function quaternionToEuler(q: Quaternion): {
  roll: number;
  pitch: number;
  yaw: number;
} {
  const { x, y, z, w } = q;

  // Roll (X axis rotation)
  const sinRollCosPitch = 2 * (w * x + y * z);
  const cosRollCosPitch = 1 - 2 * (x * x + y * y);
  const rollRad = Math.atan2(sinRollCosPitch, cosRollCosPitch);

  // Pitch (Y axis rotation) — clamped to avoid domain errors at gimbal lock
  const sinPitch = 2 * (w * y - z * x);
  const clampedSinPitch = Math.max(-1, Math.min(1, sinPitch));
  const pitchRad = Math.asin(clampedSinPitch);

  // Yaw (Z axis rotation)
  const sinYawCosPitch = 2 * (w * z + x * y);
  const cosYawCosPitch = 1 - 2 * (y * y + z * z);
  const yawRad = Math.atan2(sinYawCosPitch, cosYawCosPitch);

  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  return {
    roll: toDeg(rollRad),
    pitch: toDeg(pitchRad),
    yaw: toDeg(yawRad),
  };
}

// ---------------------------------------------------------------------------
// transformImuMessage
// ---------------------------------------------------------------------------

/**
 * Converts a raw ROS sensor_msgs/Imu message to ImuDerivedData, computing
 * Euler angles from the orientation quaternion and scalar magnitudes for both
 * linear acceleration and angular velocity.
 */
export function transformImuMessage(msg: ImuMessage): ImuDerivedData {
  const { roll, pitch, yaw } = quaternionToEuler(msg.orientation);

  const ax = msg.linear_acceleration.x;
  const ay = msg.linear_acceleration.y;
  const az = msg.linear_acceleration.z;
  const accelMagnitude = Math.sqrt(ax * ax + ay * ay + az * az);

  const wx = msg.angular_velocity.x;
  const wy = msg.angular_velocity.y;
  const wz = msg.angular_velocity.z;
  const angularVelMagnitude = Math.sqrt(wx * wx + wy * wy + wz * wz);

  const timestamp = msg.header.stamp.sec + msg.header.stamp.nsec / 1e9;

  return {
    roll,
    pitch,
    yaw,
    accelX: ax,
    accelY: ay,
    accelZ: az,
    accelMagnitude,
    angularVelX: wx,
    angularVelY: wy,
    angularVelZ: wz,
    angularVelMagnitude,
    timestamp,
  };
}
