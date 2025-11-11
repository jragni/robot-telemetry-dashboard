/**
 * useSubscriber Hook
 *
 * Generic hook for subscribing to ROS topics.
 * Handles subscription lifecycle and provides latest message data.
 */

import { useEffect, useRef, useState } from 'react';

import type { ROSLIB } from '@/contexts/ros/definitions';
import { useRosContext } from '@/contexts/ros/RosContext';

interface UseSubscriberOptions {
  topic: string;
  messageType: string;
  throttleRate?: number; // ms between messages
  enabled?: boolean; // Allow conditional subscription
}

interface UseSubscriberReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useSubscriber<T = unknown>(
  options: UseSubscriberOptions
): UseSubscriberReturn<T> {
  const { topic, messageType, throttleRate, enabled = true } = options;
  const { ros, connectionState } = useRosContext();

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const topicRef = useRef<ROSLIB.Topic | null>(null);

  useEffect(() => {
    // Only subscribe if enabled and connected
    if (!enabled || !ros || connectionState !== 'connected' || !topic) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import ROSLIB dynamically
      void import('roslib').then((module) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const ROSLIB = (module as any).default ?? module;
        // Create topic
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const rosTopic = new ROSLIB.Topic({
          ros,
          name: topic,
          messageType,
          throttle_rate: throttleRate,
        });

        // Subscribe to topic
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        rosTopic.subscribe((message: any) => {
          setData(message as T);
          setLoading(false);
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        topicRef.current = rosTopic;
      });
    } catch (err) {
      console.error(`Failed to subscribe to topic ${topic}:`, err);
      setError(err as Error);
      setLoading(false);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (topicRef.current) {
        topicRef.current.unsubscribe();
        topicRef.current = null;
      }
    };
  }, [ros, connectionState, topic, messageType, throttleRate, enabled]);

  return {
    data,
    loading,
    error,
  };
}
