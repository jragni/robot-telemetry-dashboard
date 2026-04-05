import { useCallback, useEffect, useState } from 'react';
import { connectionManager } from '@/lib/rosbridge/ConnectionManager';

export function useConnectionUptime(robotId: string | undefined, connected: boolean): number | null {
  const [uptimeSeconds, setUptimeSeconds] = useState<number | null>(null);

  const tick = useCallback(() => {
    if (!robotId) return;
    const connectedAt = connectionManager.getConnectedAt(robotId);
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
