import type { Quaternion } from '../types/ros-sensor-messages.types';

export interface EulerAngles {
  roll: number;
  pitch: number;
  yaw: number;
}

const RAD_TO_DEG = 180 / Math.PI;
const NORM_TOLERANCE = 1e-6;

export function quaternionToEuler(q: Quaternion): EulerAngles {
  const mag = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);

  let x = q.x;
  let y = q.y;
  let z = q.z;
  let w = q.w;

  if (Math.abs(mag - 1.0) > NORM_TOLERANCE) {
    console.warn(
      `quaternionToEuler: quaternion magnitude ${mag.toFixed(6)} is not unit length; normalizing.`
    );
    x /= mag;
    y /= mag;
    z /= mag;
    w /= mag;
  }

  // ZYX convention (standard ROS)
  // Roll (x-axis rotation)
  const sinrCosp = 2 * (w * x + y * z);
  const cosrCosp = 1 - 2 * (x * x + y * y);
  const roll = Math.atan2(sinrCosp, cosrCosp) * RAD_TO_DEG;

  // Pitch (y-axis rotation)
  const sinp = 2 * (w * y - z * x);
  const pitch =
    Math.abs(sinp) >= 1 ? Math.sign(sinp) * 90 : Math.asin(sinp) * RAD_TO_DEG;

  // Yaw (z-axis rotation)
  const sinyCosp = 2 * (w * z + x * y);
  const cosyCosp = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(sinyCosp, cosyCosp) * RAD_TO_DEG;

  return { roll, pitch, yaw };
}
