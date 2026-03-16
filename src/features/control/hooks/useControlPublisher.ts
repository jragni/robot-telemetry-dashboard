import { useCallback, useEffect, useMemo, useRef } from 'react';

import { CONTROL_MESSAGE_TYPE, type Direction } from '../control.types';

import { useRosConnection } from '@/features/telemetry/shared/useRosConnection';
import {
  createTopicPublisher,
  type TopicPublisherHandle,
} from '@/services/ros/TopicPublisher';
import { useControlStore } from '@/stores/control/control.store';
import type { Twist } from '@/types';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseControlPublisherResult {
  publish: (direction: Direction) => void;
  isReady: boolean;
}

// ---------------------------------------------------------------------------
// Twist message builders
// ---------------------------------------------------------------------------

function buildTwist(
  direction: Direction,
  linearVel: number,
  angularVel: number
): Twist {
  switch (direction) {
    case 'forward':
      return {
        linear: { x: linearVel, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      };
    case 'backward':
      return {
        linear: { x: -linearVel, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      };
    case 'left':
      return {
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: angularVel },
      };
    case 'right':
      return {
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: -angularVel },
      };
    case 'stop':
    default:
      return {
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      };
  }
}

// ---------------------------------------------------------------------------
// useControlPublisher
// ---------------------------------------------------------------------------

/**
 * Creates a ROS topic publisher for directional robot control.
 *
 * - Returns publish(direction) to send a Twist message and isReady indicating
 *   whether the connection is live and publishing can proceed.
 * - The underlying TopicPublisher is created/destroyed in lockstep with the
 *   ROS connection so there are no dangling advertised topics.
 */
export function useControlPublisher(
  robotId: string | undefined
): UseControlPublisherResult {
  const { ros } = useRosConnection(robotId);

  // Keep a ref to the publisher so we can call destroy on cleanup
  const publisherRef = useRef<TopicPublisherHandle<Twist> | null>(null);

  // Build (or destroy) the publisher whenever the ros instance changes
  const publisher = useMemo<TopicPublisherHandle<Twist> | null>(() => {
    if (!ros || !robotId) return null;

    const { selectedTopic } = useControlStore
      .getState()
      .getControlState(robotId);
    return createTopicPublisher<Twist>(
      ros,
      selectedTopic,
      CONTROL_MESSAGE_TYPE
    );
  }, [ros, robotId]);

  // Keep ref in sync and clean up when publisher is replaced
  useEffect(() => {
    const prev = publisherRef.current;
    publisherRef.current = publisher;

    // Destroy the previous publisher if it changed
    if (prev && prev !== publisher) {
      prev.destroy();
    }

    return () => {
      // Destroy on unmount
      publisherRef.current?.destroy();
      publisherRef.current = null;
    };
  }, [publisher]);

  const publish = useCallback(
    (direction: Direction): void => {
      if (!publisher || !robotId) return;

      const { linearVelocity, angularVelocity } = useControlStore
        .getState()
        .getControlState(robotId);
      const twist = buildTwist(direction, linearVelocity, angularVelocity);
      publisher.publish(twist);
    },
    [publisher, robotId]
  );

  return {
    publish,
    isReady: publisher !== null,
  };
}
