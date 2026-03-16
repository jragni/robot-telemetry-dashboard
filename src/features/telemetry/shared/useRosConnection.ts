import { useMemo } from 'react';
import type ROSLIB from 'roslib';

import { rosServiceRegistry } from '@/services';
import { useRosStore } from '@/stores/ros.store';
import type { ConnectionState } from '@/types';

// ---------------------------------------------------------------------------
// useRosConnection
// ---------------------------------------------------------------------------

/**
 * Returns the active ROSLIB.Ros instance and the current ConnectionState for
 * the given robotId.
 *
 * - ros is null when the robot is not connected or robotId is undefined.
 * - Memoised on [robotId, connectionState] so downstream hooks and
 *   subscriptions only re-create when the connection actually changes.
 */
export function useRosConnection(robotId: string | undefined): {
  ros: ROSLIB.Ros | null;
  connectionState: ConnectionState;
} {
  const connectionState = useRosStore((s) =>
    robotId ? s.getConnectionState(robotId) : 'disconnected'
  );

  const ros = useMemo(() => {
    if (!robotId || connectionState !== 'connected') return null;
    try {
      return rosServiceRegistry.getTransport(robotId).getRosInstance();
    } catch {
      return null;
    }
  }, [robotId, connectionState]);

  return { ros, connectionState };
}
