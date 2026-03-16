import type { RobotStatus } from '../fleet.types';

import { useConnectionsStore } from '@/stores/connections.store';
import { DEFAULT_CONTROL_STATE, useControlStore } from '@/stores/control.store';
import { useRosStore } from '@/stores/ros.store';
import { useWebRTCStore } from '@/stores/webrtc.store';

// ---------------------------------------------------------------------------
// useFleetStatus
// ---------------------------------------------------------------------------

/**
 * Returns aggregated status for ALL configured robots.
 *
 * Subscribes to the connections, ROS, WebRTC, and control stores so any
 * connection state change triggers a re-render.
 */
export function useFleetStatus(): {
  robots: RobotStatus[];
  connectedCount: number;
  totalCount: number;
} {
  const robots = useConnectionsStore((s) => s.robots);

  // Pull the full connection maps so we react to any change in any robot.
  const rosConnections = useRosStore((s) => s.connections);
  const webrtcConnections = useWebRTCStore((s) => s.connections);
  const robotControls = useControlStore((s) => s.robotControls);

  const statuses: RobotStatus[] = robots.map((robot) => {
    const rosState =
      rosConnections[robot.id]?.connectionState ?? 'disconnected';
    const webrtcState =
      webrtcConnections[robot.id]?.connectionState ?? 'disconnected';
    const isConnected = rosState === 'connected' && webrtcState === 'connected';

    const control = robotControls[robot.id] ?? { ...DEFAULT_CONTROL_STATE };

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
  });

  const connectedCount = statuses.filter((s) => s.isConnected).length;

  return {
    robots: statuses,
    connectedCount,
    totalCount: robots.length,
  };
}
