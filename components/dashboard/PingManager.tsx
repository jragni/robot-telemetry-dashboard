'use client';

import { useEffect } from 'react';
import { useConnection } from './ConnectionProvider';
import { PingMetrics } from './definitions';

/**
 * PingManager - Manages ping for all connections
 * This component runs ping monitoring for all connected robots
 */
export default function PingManager() {
  const { connections, setConnections } = useConnection();

  // Create ping handlers for each connection
  useEffect(() => {
    const activeConnections = Object.values(connections).filter(
      conn => conn.status === 'connected' && conn.rosInstance,
    );

    const cleanupFunctions: Array<() => void> = [];

    activeConnections.forEach(connection => {
      // Create ping update handler for this connection
      const handlePingUpdate = (metrics: PingMetrics) => {
        setConnections(prev => ({
          ...prev,
          [connection.id]: {
            ...prev[connection.id],
            ping: metrics,
          },
        }));
      };

      // This would ideally be a custom hook per connection
      // For now, we'll handle it in the parent component
      const pingInterval = setInterval(() => {
        if (!connection.rosInstance) return;

        const startTime = Date.now();
        let settled = false;

        const timeoutId = setTimeout(() => {
          if (!settled) {
            settled = true;
            handlePingUpdate({
              latency: -1,
              lastPing: new Date(),
              status: 'timeout',
              history: [],
            });
          }
        }, 3000);

        try {
          // Use getTopics as a simple ping mechanism
          connection.rosInstance.getTopics(
            () => {
              if (!settled) {
                settled = true;
                clearTimeout(timeoutId);
                const latency = Date.now() - startTime;

                const status = latency < 100 ? 'good' :
                  latency < 300 ? 'fair' : 'poor';

                handlePingUpdate({
                  latency,
                  lastPing: new Date(),
                  status,
                  history: [], // We'll implement history later
                });
              }
            },
            () => {
              if (!settled) {
                settled = true;
                clearTimeout(timeoutId);
                handlePingUpdate({
                  latency: -1,
                  lastPing: new Date(),
                  status: 'timeout',
                  history: [],
                });
              }
            },
          );
        } catch (_error) {
          if (!settled) {
            settled = true;
            clearTimeout(timeoutId);
            handlePingUpdate({
              latency: -1,
              lastPing: new Date(),
              status: 'timeout',
              history: [],
            });
          }
        }
      }, 5000); // Ping every 5 seconds

      cleanupFunctions.push(() => clearInterval(pingInterval));
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [connections, setConnections]);

  return <div data-testid="ping-manager" style={{ display: 'none' }} />; // Hidden component for testing
}