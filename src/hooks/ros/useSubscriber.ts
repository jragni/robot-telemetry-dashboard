/**
 * useSubscriber Hook
 *
 * Generic hook for subscribing to ROS topics.
 * Handles subscription lifecycle and provides latest message data.
 */

import { useEffect, useRef, useState } from 'react';
import ROSLIB from 'roslib';

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
      // Create topic
      const rosTopic = new ROSLIB.Topic({
        ros,
        name: topic,
        messageType,
        throttle_rate: throttleRate,
      });

      // Subscribe to topic
      rosTopic.subscribe((message) => {
        setData(message as T);
        setLoading(false);
      });

      topicRef.current = rosTopic;
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
