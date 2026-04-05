import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { RECONNECT_MAX_ATTEMPTS } from '@/constants/reconnection';
import type { ConnectionStatus } from '@/stores/connection/useConnectionStore.types';

/** ConnectionToastProvider
 * @description Subscribes to the connection store and fires toast notifications
 *  on robot status transitions. Reads reconnectAttempt from the store to display
 *  attempt count on each retry. Shows error on final failure.
 */
export function ConnectionToastProvider() {
  const prevStatusRef = useRef(new Map<string, ConnectionStatus>());

  useEffect(() => {
    const initial = useConnectionStore.getState().robots;
    for (const [id, robot] of Object.entries(initial)) {
      prevStatusRef.current.set(id, robot.status);
    }

    const unsubscribe = useConnectionStore.subscribe((state) => {
      const prev = prevStatusRef.current;

      for (const [id, robot] of Object.entries(state.robots)) {
        const prevStatus = prev.get(id);
        const toastId = `reconnect-${id}`;

        if (prevStatus && prevStatus !== robot.status) {
          // Every connecting transition — show/update loading toast with attempt count
          if (robot.status === 'connecting') {
            const attempt = robot.reconnectAttempt ?? 1;
            toast.loading(`Reconnecting to ${robot.name}... (attempt ${String(attempt)}/${String(RECONNECT_MAX_ATTEMPTS)})`, {
              action: { label: 'Dismiss', onClick: () => { toast.dismiss(toastId); } },
              dismissible: true,
              id: toastId,
            });
          }

          // Reconnected successfully
          if (robot.status === 'connected') {
            toast.success(`${robot.name} reconnected`, {
              dismissible: true, duration: 3000, id: toastId,
            });
          }

          // Final failure — replace loading toast with error
          if (robot.status === 'error') {
            toast.error(`${robot.name} connection failed`, {
              action: { label: 'Dismiss', onClick: () => { toast.dismiss(toastId); } },
              description: robot.lastError ?? 'Connection error',
              dismissible: true,
              duration: Infinity,
              id: toastId,
            });
          }
        }

        prev.set(id, robot.status);
      }

      for (const id of prev.keys()) {
        if (!state.robots[id]) {
          prev.delete(id);
        }
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
