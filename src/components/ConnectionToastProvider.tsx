import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { RECONNECT_MAX_ATTEMPTS } from '@/constants/reconnection.constants';
import type { ConnectionStatus } from '@/stores/connection/useConnectionStore.types';

/** ConnectionToastProvider
 * @description Subscribes to the connection store and fires toast notifications
 *  on robot status transitions. Updates the loading toast with attempt count
 *  on each retry. Shows error on final failure.
 */
export function ConnectionToastProvider() {
  const prevStatusRef = useRef(new Map<string, ConnectionStatus>());
  const attemptRef = useRef(new Map<string, number>());

  useEffect(() => {
    const initial = useConnectionStore.getState().robots;
    for (const [id, robot] of Object.entries(initial)) {
      prevStatusRef.current.set(id, robot.status);
    }

    const unsubscribe = useConnectionStore.subscribe((state) => {
      const prev = prevStatusRef.current;
      const attempts = attemptRef.current;

      for (const [id, robot] of Object.entries(state.robots)) {
        const prevStatus = prev.get(id);
        const toastId = `reconnect-${id}`;

        if (prevStatus && prevStatus !== robot.status) {
          // Every connecting transition — show/update loading toast with attempt count
          if (robot.status === 'connecting') {
            const attempt = (attempts.get(id) ?? 0) + 1;
            attempts.set(id, attempt);
            toast.loading(`Reconnecting to ${robot.name}... (attempt ${String(attempt)}/${String(RECONNECT_MAX_ATTEMPTS)})`, {
              id: toastId,
              dismissible: true,
              action: { label: 'Dismiss', onClick: () => { toast.dismiss(toastId); } },
            });
          }

          // Reconnected successfully
          if (robot.status === 'connected') {
            attempts.delete(id);
            toast.success(`${robot.name} reconnected`, {
              id: toastId, dismissible: true, duration: 3000,
            });
          }

          // Final failure — replace loading toast with error
          if (robot.status === 'error') {
            attempts.delete(id);
            toast.error(`${robot.name} connection failed`, {
              id: toastId,
              dismissible: true,
              duration: Infinity,
              description: robot.lastError ?? 'Connection error',
              action: { label: 'Dismiss', onClick: () => { toast.dismiss(toastId); } },
            });
          }

          // Reset attempts on manual disconnect
          if (robot.status === 'disconnected') {
            attempts.delete(id);
          }
        }

        prev.set(id, robot.status);
      }

      for (const id of prev.keys()) {
        if (!state.robots[id]) {
          prev.delete(id);
          attempts.delete(id);
        }
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
