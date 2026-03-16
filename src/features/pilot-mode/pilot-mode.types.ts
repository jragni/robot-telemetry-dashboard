import type { ConnectionState } from '@/types';

// ---------------------------------------------------------------------------
// PilotHudData
// ---------------------------------------------------------------------------

/**
 * Aggregated runtime data consumed by all HUD elements in the pilot layout.
 * All optional fields are populated only when the relevant ROS topics are
 * available (IMU for heading, battery topic for percentage).
 */
export interface PilotHudData {
  /** ROS bridge connection state for this robot. */
  rosConnectionState: ConnectionState;
  /** WebRTC video stream connection state for this robot. */
  webrtcConnectionState: ConnectionState;
  /** Current configured linear velocity limit (m/s). */
  linearVelocity: number;
  /** Current configured angular velocity limit (rad/s). */
  angularVelocity: number;
  /** Yaw in degrees derived from IMU quaternion, if available. */
  heading?: number;
  /** Battery percentage 0–100, if available. */
  batteryPercentage?: number;
}
