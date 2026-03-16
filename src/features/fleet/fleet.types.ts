import type { ConnectionState, RobotConnection } from '@/types';

// ---------------------------------------------------------------------------
// RobotStatus
// ---------------------------------------------------------------------------

/**
 * Aggregated status for a single robot — combines data from the connections
 * store, the ROS store, the WebRTC store, and the control store into one
 * convenient shape for fleet UI components.
 */
export interface RobotStatus {
  /** The robot configuration record from the connections store. */
  robot: RobotConnection;
  /** Current ROS bridge connection state. */
  rosState: ConnectionState;
  /** Current WebRTC video connection state. */
  webrtcState: ConnectionState;
  /** True when both ROS and WebRTC are in the 'connected' state. */
  isConnected: boolean;
  /** Snapshot of the robot's control state. */
  controlState: {
    linearVelocity: number;
    angularVelocity: number;
    isEStopActive: boolean;
  };
}
