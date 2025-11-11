/**
 * useRos Hook
 *
 * Custom hook for managing ROS connection lifecycle.
 * Handles connection, disconnection, and auto-reconnection.
 */

import { useEffect, useRef, useState } from 'react';
import ROSLIB from 'roslib';

import { CONNECTION_CONFIG } from '@/config/ros';
import type { ConnectionState } from '@/contexts/ros/definitions';

interface UseRosOptions {
  url?: string; // Optional - can be set later via context
  autoConnect?: boolean; // Auto-connect when URL becomes available
}

interface UseRosReturn {
  ros: ROSLIB.Ros | null;
  connectionState: ConnectionState;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

export function useRos(options: UseRosOptions = {}): UseRosReturn {
  const { url, autoConnect = false } = options;

  const [ros, setRos] = useState<ROSLIB.Ros | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldConnectRef = useRef(false);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const connect = () => {
    if (!url) {
      setError(new Error('Robot URL is required'));
      setConnectionState('error');
      return;
    }

    try {
      clearReconnectTimeout();
      setConnectionState('connecting');
      setError(null);
      shouldConnectRef.current = true;

      const rosInstance = new ROSLIB.Ros({ url });

      // Connection opened
      rosInstance.on('connection', () => {
        console.log('Connected to ROS bridge');
        setConnectionState('connected');
        setError(null);
      });

      // Connection error
      rosInstance.on('error', (err: unknown) => {
        console.error('ROS connection error:', err);
        setConnectionState('error');
        setError(
          new Error(
            typeof err === 'string' ? err : 'ROS connection error occurred'
          )
        );

        // Auto-reconnect if enabled
        if (CONNECTION_CONFIG.autoReconnect && shouldConnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, CONNECTION_CONFIG.reconnectInterval);
        }
      });

      // Connection closed
      rosInstance.on('close', () => {
        console.log('ROS connection closed');
        setConnectionState('disconnected');

        // Auto-reconnect if enabled and we should be connected
        if (CONNECTION_CONFIG.autoReconnect && shouldConnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, CONNECTION_CONFIG.reconnectInterval);
        }
      });

      setRos(rosInstance);
    } catch (err) {
      console.error('Failed to create ROS connection:', err);
      setError(err as Error);
      setConnectionState('error');
    }
  };

  const disconnect = () => {
    shouldConnectRef.current = false;
    clearReconnectTimeout();

    if (ros) {
      ros.close();
      setRos(null);
    }

    setConnectionState('disconnected');
    setError(null);
  };

  // Auto-connect when URL becomes available (if enabled)
  useEffect(() => {
    if (autoConnect && url && !ros) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldConnectRef.current = false;
      clearReconnectTimeout();
      if (ros) {
        ros.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ros,
    connectionState,
    error,
    connect,
    disconnect,
  };
}
