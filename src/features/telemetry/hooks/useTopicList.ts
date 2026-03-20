import { useEffect, useRef, useState } from 'react';

import type { RosTopic, UseTopicListResult } from './useTopicList.types';

import { rosServiceRegistry } from '@/services/ros/registry/RosServiceRegistry';
import { useRosStore } from '@/shared/stores/ros/ros.store';

const RETRY_INTERVAL_MS = 5000;

export function useTopicList(robotId: string): UseTopicListResult {
  const [topics, setTopics] = useState<RosTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped every time the robot transitions TO 'connected' — used as an effect dep
  // to ensure re-fetch even when React batches disconnected→connected transitions
  // that result in the same final connectionState value.
  const [connectEpoch, setConnectEpoch] = useState(0);

  const connectionState = useRosStore(
    (state) => state.connectionStates[robotId]?.state ?? 'disconnected'
  );

  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to Zustand state transitions to detect each reconnect event
  useEffect(() => {
    const unsub = useRosStore.subscribe((state, prevState) => {
      const prev = prevState.connectionStates[robotId]?.state;
      const next = state.connectionStates[robotId]?.state;
      if (prev !== 'connected' && next === 'connected') {
        setConnectEpoch((e) => e + 1);
      }
    });
    return unsub;
  }, [robotId]);

  useEffect(() => {
    if (connectionState !== 'connected') return;

    let cancelled = false;

    function fetchTopics() {
      if (cancelled) return;

      const transport = rosServiceRegistry.get(robotId);
      if (!transport) return;

      const ros = transport.getRos();

      if (!ros.isConnected) {
        if (!cancelled) {
          setError('Not connected');
          setIsLoading(false);
        }
        return;
      }

      ros.getTopics(
        (result: { topics: string[]; types: string[] }) => {
          if (cancelled) return;

          const topicList: RosTopic[] = result.topics.map((name, i) => ({
            name,
            type: result.types[i] ?? '',
          }));

          setTopics(topicList);
          setIsLoading(false);
          setError(null);

          // Retry if empty
          if (topicList.length === 0) {
            retryTimer.current = setTimeout(fetchTopics, RETRY_INTERVAL_MS);
          }
        },
        (err: string) => {
          if (cancelled) return;
          setError(err);
          setIsLoading(false);
        }
      );
    }

    fetchTopics();

    return () => {
      cancelled = true;
      if (retryTimer.current !== null) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    };
    // connectEpoch ensures re-fetch on every reconnect transition
  }, [robotId, connectionState, connectEpoch]);

  return { topics, isLoading, error };
}
