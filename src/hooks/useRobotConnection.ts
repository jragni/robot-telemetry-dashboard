import { useCallback } from 'react';
import type { Ros } from 'roslib';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import * as ConnectionManager from '@/lib/rosbridge/ConnectionManager';

/** useRobotConnection
 * @description Convenience hook for reading a robot's connection state and
 *  accessing its live Ros instance. Combines store selectors with
 *  ConnectionManager lookups in a single API.
 * @param robotId - The robot ID to read from the connection store.
 */
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
