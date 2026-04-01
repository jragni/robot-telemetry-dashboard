import { useCallback, useEffect, useState } from 'react';
import * as ConnectionManager from '@/lib/rosbridge/ConnectionManager';

/** useConnectionUptime
 * @description Calculates connection duration in seconds by reading the
 *  connectedAt timestamp from ConnectionManager and ticking every second.
 * @param robotId - The robot ID to track uptime for.
 * @param connected - Whether the robot is currently connected.
 */
export function useConnectionUptime(robotId: string | undefined, connected: boolean): number | null {
  const [uptimeSeconds, setUptimeSeconds] = useState<number | null>(null);

  const tick = useCallback(() => {
    if (!robotId) return;
    const connectedAt = ConnectionManager.getConnectedAt(robotId);
    if (connectedAt) {
      setUptimeSeconds(Math.floor((Date.now() - connectedAt) / 1000));
    }
  }, [robotId]);

  useEffect(() => {
    if (!robotId || !connected) return;

    const interval = setInterval(tick, 1000);

    return () => {
      clearInterval(interval);
      setUptimeSeconds(null);
    };
  }, [robotId, connected, tick]);

  return uptimeSeconds;
}
