/**
 * usePublisher Hook
 *
 * Generic hook for publishing to ROS topics.
 * Creates a publisher and provides a publish function.
 */

import { useEffect, useRef } from 'react';

import type { ROSLIB } from '@/contexts/ros/definitions';
import { useRosContext } from '@/contexts/ros/RosContext';

interface UsePublisherOptions {
  topic: string;
  messageType: string;
  queueSize?: number;
}

interface UsePublisherReturn<T> {
  publish: (message: T) => void;
  isReady: boolean;
}

export function usePublisher<T = unknown>(
  options: UsePublisherOptions
): UsePublisherReturn<T> {
  const { topic, messageType, queueSize } = options;
  const { ros, connectionState } = useRosContext();

  const topicRef = useRef<ROSLIB.Topic | null>(null);

  useEffect(() => {
    if (!ros || connectionState !== 'connected' || !topic) {
      topicRef.current = null;
      return;
    }

    // Import ROSLIB dynamically
    void import('roslib').then(({ default: ROSLIB }) => {
      // Create topic for publishing
      const rosTopic = new ROSLIB.Topic({
        ros,
        name: topic,
        messageType,
        queue_size: queueSize,
      });

      topicRef.current = rosTopic;
    });

    // Cleanup on unmount or when dependencies change
    return () => {
      if (topicRef.current) {
        topicRef.current.unadvertise();
        topicRef.current = null;
      }
    };
  }, [ros, connectionState, topic, messageType, queueSize]);

  const publish = (message: T) => {
    if (topicRef.current && connectionState === 'connected') {
      try {
        // Import ROSLIB dynamically
        void import('roslib').then(({ default: ROSLIB }) => {
          const rosMessage = new ROSLIB.Message(message);
          topicRef.current?.publish(rosMessage);
        });
      } catch (err) {
        console.error(`Failed to publish to topic ${topic}:`, err);
      }
    } else {
      console.warn(
        `Cannot publish to ${topic}: ${connectionState !== 'connected' ? 'not connected' : 'topic not ready'}`
      );
    }
  };

  return {
    publish,
    isReady: !!topicRef.current && connectionState === 'connected',
  };
}
