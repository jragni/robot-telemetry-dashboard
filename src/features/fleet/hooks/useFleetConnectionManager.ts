import { useCallback } from 'react';

import { rosServiceRegistry } from '@/services/ros/RosServiceRegistry';
import { webRTCServiceRegistry } from '@/services/webrtc/WebRTCServiceRegistry';
import { useConnectionsStore } from '@/stores/connections.store';

// ---------------------------------------------------------------------------
// useFleetConnectionManager
// ---------------------------------------------------------------------------

/**
 * Provides connect/disconnect actions for individual robots and for the whole
 * fleet simultaneously.
 *
 * Both ROS and WebRTC transports are managed together — connecting a robot
 * starts both, disconnecting stops both.
 */
export function useFleetConnectionManager(): {
  connectAll: () => void;
  disconnectAll: () => void;
  connectRobot: (robotId: string) => void;
  disconnectRobot: (robotId: string) => void;
} {
  const robots = useConnectionsStore((s) => s.robots);

  const connectRobot = useCallback(
    (robotId: string) => {
      const robot = robots.find((r) => r.id === robotId);
      if (!robot) return;
      rosServiceRegistry.connect(robotId, robot.baseUrl);
      webRTCServiceRegistry.connect(robotId, robot.baseUrl);
    },
    [robots]
  );

  const disconnectRobot = useCallback((robotId: string) => {
    rosServiceRegistry.disconnect(robotId);
    webRTCServiceRegistry.disconnect(robotId);
  }, []);

  const connectAll = useCallback(() => {
    for (const robot of robots) {
      rosServiceRegistry.connect(robot.id, robot.baseUrl);
      webRTCServiceRegistry.connect(robot.id, robot.baseUrl);
    }
  }, [robots]);

  const disconnectAll = useCallback(() => {
    for (const robot of robots) {
      rosServiceRegistry.disconnect(robot.id);
      webRTCServiceRegistry.disconnect(robot.id);
    }
  }, [robots]);

  return { connectAll, disconnectAll, connectRobot, disconnectRobot };
}
