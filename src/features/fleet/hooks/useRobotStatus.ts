import type { RobotStatus } from '../fleet.types';

import { useConnectionsStore } from '@/stores/connections.store';
import { DEFAULT_CONTROL_STATE, useControlStore } from '@/stores/control.store';
import { useRosStore } from '@/stores/ros.store';
import { useWebRTCStore } from '@/stores/webrtc.store';

// ---------------------------------------------------------------------------
// useRobotStatus
// ---------------------------------------------------------------------------

/**
 * Aggregates status for a single robot by combining data from the connections
 * store, ROS store, WebRTC store, and control store.
 *
 * Returns undefined when no robot with robotId exists in the connections store.
 */
export function useRobotStatus(robotId: string): RobotStatus | undefined {
  const robot = useConnectionsStore((s) =>
    s.robots.find((r) => r.id === robotId)
  );

  const rosState = useRosStore((s) => s.getConnectionState(robotId));
  const webrtcState = useWebRTCStore((s) => s.getConnectionState(robotId));
  const controlEntry = useControlStore((s) => s.getControlState(robotId));

  if (!robot) return undefined;

  const isConnected = rosState === 'connected' && webrtcState === 'connected';

  const control = controlEntry ?? DEFAULT_CONTROL_STATE;

  return {
    robot,
    rosState,
    webrtcState,
    isConnected,
    controlState: {
      linearVelocity: control.linearVelocity,
      angularVelocity: control.angularVelocity,
      isEStopActive: control.isEStopActive,
    },
  };
}
