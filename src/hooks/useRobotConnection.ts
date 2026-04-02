import { useCallback } from 'react';
import type { Ros } from 'roslib';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import * as ConnectionManager from '@/lib/rosbridge/ConnectionManager';

export function useRobotConnection(robotId: string | undefined) {
  const robot = useConnectionStore((s) => (robotId ? s.robots[robotId] : undefined));
  const connectRobot = useConnectionStore((s) => s.connectRobot);
  const disconnectRobot = useConnectionStore((s) => s.disconnectRobot);

  const connected = robot?.status === 'connected';
  const ros: Ros | undefined = robotId ? ConnectionManager.getConnection(robotId) : undefined;

  const connect = useCallback(() => {
    if (robotId) void connectRobot(robotId);
  }, [robotId, connectRobot]);

  const disconnect = useCallback(() => {
    if (robotId) disconnectRobot(robotId);
  }, [robotId, disconnectRobot]);

  return { robot, connected, ros, connect, disconnect };
}
