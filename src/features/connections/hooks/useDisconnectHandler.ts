import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useControlStore } from '@/stores/control/control.store';
import { useRosStore } from '@/stores/ros/ros.store';
import type { ConnectionState } from '@/types/connection.types';

// ---------------------------------------------------------------------------
// useDisconnectHandler
// ---------------------------------------------------------------------------

/**
 * Monitors the ROS connection state for a single robot and reacts to
 * unexpected disconnects:
 *
 * - On transition from 'connected' → 'error' | 'disconnected':
 *   Shows a Sonner warning toast and activates the E-Stop for the robot.
 *
 * - On transition from 'error' | 'disconnected' → 'connected':
 *   Shows a success toast and deactivates the E-Stop.
 *
 * Auto-reconnect is handled by RosTransport internally; this hook only
 * manages the UI feedback and safety state.
 *
 * @param robotId - The ID of the robot to monitor.
 */
export function useDisconnectHandler(robotId: string): void {
  const connectionState = useRosStore((s) => s.getConnectionState(robotId));
  const prevStateRef = useRef<ConnectionState>(connectionState);

  useEffect(() => {
    const prev = prevStateRef.current;
    const curr = connectionState;

    if (prev === curr) return;

    const wasConnected = prev === 'connected';
    const isNowLost = (
      ['disconnected', 'error', 'connecting'] as ConnectionState[]
    ).includes(curr);
    const isNowConnected = curr === 'connected';

    if (wasConnected && isNowLost) {
      // Safety: engage E-Stop when connection drops unexpectedly.
      useControlStore.getState().activateEStop(robotId);

      if (curr === 'connecting') {
        toast.warning(`Robot lost — reconnecting…`, {
          id: `disconnect-${robotId}`,
          description: `Connection to robot ${robotId.slice(0, 8)} was interrupted.`,
        });
      } else {
        toast.error(`Robot disconnected`, {
          id: `disconnect-${robotId}`,
          description: `Lost connection to robot ${robotId.slice(0, 8)}.`,
        });
      }
    }

    if (!wasConnected && isNowConnected) {
      // Re-enable controls once the robot is back.
      useControlStore.getState().deactivateEStop(robotId);

      toast.success(`Robot reconnected`, {
        id: `disconnect-${robotId}`,
        description: `Connection to robot ${robotId.slice(0, 8)} restored.`,
      });
    }

    prevStateRef.current = curr;
  }, [connectionState, robotId]);
}
