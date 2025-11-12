/**
 * useRos Hook
 *
 * Custom hook for managing ROS connection lifecycle.
 * Handles connection, disconnection, and auto-reconnection.
 */

import { useEffect, useRef, useState } from 'react';
import ROSLIB from 'roslib';
import { toast } from 'sonner';

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
  const connectionAttemptRef = useRef<number>(0);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Internal connection function with attempt tracking
  const attemptConnection = () => {
    if (!url) {
      setError(new Error('Robot URL is required'));
      setConnectionState('error');
      return;
    }

    // Check if we've exceeded max connection attempts
    if (connectionAttemptRef.current >= 3) {
      console.log('Max connection attempts (3) reached');
      const errorMsg = 'Failed to connect after 3 attempts';
      setError(new Error(errorMsg));
      setConnectionState('error');
      shouldConnectRef.current = false;

      // Show toast notification
      toast.error('Connection Failed', {
        description: `${errorMsg}. Please check your robot connection and try again.`,
        duration: 5000,
      });
      return;
    }

    connectionAttemptRef.current += 1;
    console.log(`Connection attempt ${connectionAttemptRef.current} of 3`);

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
        connectionAttemptRef.current = 0; // Reset attempts on successful connection
      });

      // Connection error
      rosInstance.on('error', (err: unknown) => {
        console.error('ROS connection error:', err);
        const errorMessage =
          typeof err === 'string' ? err : 'ROS connection error occurred';

        setConnectionState('error');
        setError(new Error(errorMessage));

        // Show toast for connection error
        toast.error(
          `Connection Attempt ${connectionAttemptRef.current} Failed`,
          {
            description: errorMessage,
            duration: 3000,
          }
        );

        // Auto-reconnect if enabled
        if (CONNECTION_CONFIG.autoReconnect && shouldConnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            attemptConnection();
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
            attemptConnection();
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

  // Public connect function - resets attempts for manual connection
  const connect = () => {
    console.log('Manual connect - resetting attempt counter');
    connectionAttemptRef.current = 0;
    attemptConnection();
  };

  const disconnect = () => {
    shouldConnectRef.current = false;
    clearReconnectTimeout();
    connectionAttemptRef.current = 0; // Reset attempts on manual disconnect

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
      attemptConnection();
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
