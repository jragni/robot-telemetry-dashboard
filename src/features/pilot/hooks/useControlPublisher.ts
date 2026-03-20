import { useEffect, useRef } from 'react';

import type { createControlStore } from '../stores/controlStore';
import { buildTwist, zeroTwist } from '../utils/twistBuilder';

import type { TopicPublisher } from '@/services/ros/publisher/TopicPublisher';
import type { PublishHandle } from '@/services/ros/publisher/TopicPublisher.types';
import { useRosStore } from '@/shared/stores/ros/ros.store';
import type { Twist } from '@/shared/types/ros-messages.types';

export interface UseControlPublisherOptions {
  robotId: string;
  controlStore: ReturnType<typeof createControlStore>;
  publisher: TopicPublisher;
}

export function useControlPublisher({
  robotId,
  controlStore,
  publisher,
}: UseControlPublisherOptions): void {
  const connectionState = useRosStore(
    (state) => state.connectionStates[robotId]?.state ?? 'disconnected'
  );

  const prevConnectionRef = useRef<string>(connectionState);
  const publishHandleRef = useRef<PublishHandle<Twist> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize/update publish handle when topic changes
  useEffect(() => {
    const { selectedTopic } = controlStore.getState();

    if (publishHandleRef.current) {
      publishHandleRef.current.dispose();
    }

    publishHandleRef.current = publisher.createTopicPublisher<Twist>({
      topicName: selectedTopic,
      messageType: 'geometry_msgs/Twist',
    });

    return () => {
      publishHandleRef.current?.dispose();
      publishHandleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publisher]);

  // Watch topic changes from the store
  useEffect(() => {
    return controlStore.subscribe((state, prev) => {
      if (state.selectedTopic === prev.selectedTopic) return;

      // Clear active direction on topic change
      if (state.activeDirection !== null) {
        publishHandleRef.current?.publish(zeroTwist());
        controlStore.getState().setDirection(null);
      }

      // Recreate handle for new topic
      publishHandleRef.current?.dispose();
      publishHandleRef.current = publisher.createTopicPublisher<Twist>({
        topicName: state.selectedTopic,
        messageType: 'geometry_msgs/Twist',
      });
    });
  }, [publisher, controlStore]);

  // Manage publish interval based on activeDirection
  useEffect(() => {
    return controlStore.subscribe((state) => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (state.activeDirection !== null && !state.eStopActive) {
        intervalRef.current = setInterval(() => {
          const {
            activeDirection,
            linearVelocity,
            angularVelocity,
            eStopActive,
          } = controlStore.getState();
          if (activeDirection === null || eStopActive) return;
          publishHandleRef.current?.publish(
            buildTwist(activeDirection, linearVelocity, angularVelocity)
          );
        }, 50);
      } else if (state.activeDirection === null) {
        publishHandleRef.current?.publish(zeroTwist());
      }
    });
  }, [controlStore]);

  // Auto e-stop on connection loss
  useEffect(() => {
    const prevStatus = prevConnectionRef.current;
    if (prevStatus === 'connected' && connectionState !== 'connected') {
      publishHandleRef.current?.publish(zeroTwist());
      controlStore.getState().activateEStop();
    }
    prevConnectionRef.current = connectionState;
  }, [connectionState, controlStore]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
}
