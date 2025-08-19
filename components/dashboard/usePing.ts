import { useEffect, useRef, useCallback } from 'react';
import { PingMetrics } from './definitions';

interface UsePingOptions {
  interval?: number; // ping interval in milliseconds
  timeout?: number; // ping timeout in milliseconds
  enabled?: boolean; // whether ping is enabled
}

interface UsePingReturn {
  startPing: () => void;
  stopPing: () => void;
  ping: () => Promise<number>;
}

/**
 * Custom hook for ROS connection ping/latency measurement
 * Uses a simple echo service call to measure round-trip time
 */
export function usePing(
  rosInstance: ROSLIB.Ros | undefined,
  onPingUpdate: (metrics: PingMetrics) => void,
  options: UsePingOptions = {},
): UsePingReturn {
  const {
    interval = 5000, // 5 seconds default
    timeout = 3000,  // 3 seconds timeout
    enabled = true,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);
  const historyRef = useRef<number[]>([]);

  const calculatePingStatus = (latency: number): PingMetrics['status'] => {
    if (latency < 0) return 'timeout';
    if (latency < 100) return 'good';
    if (latency < 300) return 'fair';
    return 'poor';
  };

  const updateHistory = (latency: number) => {
    historyRef.current.push(latency);
    if (historyRef.current.length > 10) {
      historyRef.current.shift();
    }
  };

  const ping = useCallback(async (): Promise<number> => {
    if (!rosInstance || !enabled) {
      return -1;
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      let settled = false;

      // Set timeout for ping
      const timeoutId = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(-1); // timeout
        }
      }, timeout);

      try {
        // Use a simple service call to measure latency
        // ROS bridge typically has a /rosapi/nodes service that's lightweight
        const ROSLIB = require('roslib').default;

        const service = new ROSLIB.Service({
          ros: rosInstance,
          name: '/rosapi/nodes',
          serviceType: 'rosapi/Nodes',
        });

        const request = new ROSLIB.ServiceRequest({});

        service.callService(request,
          (result: any) => {
            if (!settled) {
              settled = true;
              clearTimeout(timeoutId);
              const latency = Date.now() - startTime;
              resolve(latency);
            }
          },
          (error: any) => {
            // If /rosapi/nodes fails, try a simple topic list as fallback
            if (!settled) {
              rosInstance.getTopics(
                () => {
                  if (!settled) {
                    settled = true;
                    clearTimeout(timeoutId);
                    const latency = Date.now() - startTime;
                    resolve(latency);
                  }
                },
                () => {
                  if (!settled) {
                    settled = true;
                    clearTimeout(timeoutId);
                    resolve(-1); // error
                  }
                },
              );
            }
          },
        );
      } catch (error) {
        if (!settled) {
          settled = true;
          clearTimeout(timeoutId);
          resolve(-1);
        }
      }
    });
  }, [rosInstance, enabled, timeout]);

  const performPing = useCallback(async () => {
    if (!isRunningRef.current || !enabled) return;

    const latency = await ping();
    updateHistory(latency);

    const metrics: PingMetrics = {
      latency,
      lastPing: new Date(),
      status: calculatePingStatus(latency),
      history: [...historyRef.current],
    };

    onPingUpdate(metrics);
  }, [ping, onPingUpdate, enabled]);

  const startPing = useCallback(() => {
    if (!rosInstance || !enabled) return;

    isRunningRef.current = true;

    // Perform initial ping
    performPing();

    // Set up interval
    intervalRef.current = setInterval(performPing, interval);
  }, [rosInstance, enabled, performPing, interval]);

  const stopPing = useCallback(() => {
    isRunningRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto-start when conditions are met
  useEffect(() => {
    if (rosInstance && enabled) {
      startPing();
    } else {
      stopPing();
    }

    return stopPing;
  }, [rosInstance, enabled, startPing, stopPing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPing();
    };
  }, [stopPing]);

  return {
    startPing,
    stopPing,
    ping,
  };
}