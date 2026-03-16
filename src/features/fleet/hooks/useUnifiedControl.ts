import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  CONTROL_MESSAGE_TYPE,
  type Direction,
} from '@/features/control/control.types';
import { useRosConnection } from '@/features/telemetry/shared/useRosConnection';
import {
  createTopicPublisher,
  type TopicPublisherHandle,
} from '@/services/ros/TopicPublisher';
import { useControlStore } from '@/stores/control.store';
import type { Twist } from '@/types';

// ---------------------------------------------------------------------------
// Internal helpers
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
// Single-robot publisher hook (internal, not exported)
// ---------------------------------------------------------------------------

/**
 * Returns a publisher handle and readiness flag for one robot.
 * This follows the same pattern as useControlPublisher but is scoped to be
 * composed inside useUnifiedControl.
 */
function useRobotPublisher(robotId: string): {
  publisher: TopicPublisherHandle<Twist> | null;
  isReady: boolean;
} {
  const { ros } = useRosConnection(robotId);

  const publisherRef = useRef<TopicPublisherHandle<Twist> | null>(null);

  const publisher = useMemo<TopicPublisherHandle<Twist> | null>(() => {
    if (!ros) return null;
    const { selectedTopic } = useControlStore
      .getState()
      .getControlState(robotId);
    return createTopicPublisher<Twist>(
      ros,
      selectedTopic,
      CONTROL_MESSAGE_TYPE
    );
  }, [ros, robotId]);

  useEffect(() => {
    const prev = publisherRef.current;
    publisherRef.current = publisher;
    if (prev && prev !== publisher) {
      prev.destroy();
    }
    return () => {
      publisherRef.current?.destroy();
      publisherRef.current = null;
    };
  }, [publisher]);

  return { publisher, isReady: publisher !== null };
}

// ---------------------------------------------------------------------------
// useUnifiedControl
// ---------------------------------------------------------------------------

/**
 * Manages command broadcasting to multiple robots simultaneously.
 *
 * Creates one ROS publisher per selected robot and broadcasts the same Twist
 * message to all of them on every publish() call.
 *
 * isReady is true only when ALL selected robots have an active publisher
 * (i.e., every robot is connected). An empty selection returns isReady false.
 */
export function useUnifiedControl(selectedRobotIds: string[]): {
  publish: (direction: Direction) => void;
  isReady: boolean;
} {
  // Hooks must be called unconditionally — we support up to N robots by
  // always calling for a stable set. Because selectedRobotIds can change
  // length between renders (which would violate the Rules of Hooks), we use
  // a single hook that wraps all publishers imperatively via refs.

  // Robot 0–7 slots (covers realistic fleet sizes without dynamic hook calls)
  const slot0 = useRobotPublisher(selectedRobotIds[0] ?? '');
  const slot1 = useRobotPublisher(selectedRobotIds[1] ?? '');
  const slot2 = useRobotPublisher(selectedRobotIds[2] ?? '');
  const slot3 = useRobotPublisher(selectedRobotIds[3] ?? '');
  const slot4 = useRobotPublisher(selectedRobotIds[4] ?? '');
  const slot5 = useRobotPublisher(selectedRobotIds[5] ?? '');
  const slot6 = useRobotPublisher(selectedRobotIds[6] ?? '');
  const slot7 = useRobotPublisher(selectedRobotIds[7] ?? '');

  const allSlots = [slot0, slot1, slot2, slot3, slot4, slot5, slot6, slot7];

  // Only consider slots that map to an actual selected robot id.
  const activeSlots = allSlots.slice(0, selectedRobotIds.length);

  const isReady =
    selectedRobotIds.length > 0 && activeSlots.every((s) => s.isReady);

  const publish = useCallback(
    (direction: Direction) => {
      if (selectedRobotIds.length === 0) return;

      selectedRobotIds.forEach((robotId, index) => {
        const slot = allSlots[index];
        if (!slot?.publisher) return;

        const { linearVelocity, angularVelocity } = useControlStore
          .getState()
          .getControlState(robotId);
        const twist = buildTwist(direction, linearVelocity, angularVelocity);
        slot.publisher.publish(twist);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedRobotIds, ...allSlots.map((s) => s.publisher)]
  );

  return { publish, isReady };
}
