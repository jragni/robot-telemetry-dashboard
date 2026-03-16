import { useState, useCallback, useMemo } from 'react';
import { take } from 'rxjs/operators';

import {
  MAP_DEFAULT_TOPIC,
  MAP_MESSAGE_TYPE,
  type ParsedOccupancyGrid,
} from '../slam.types';
import { parseOccupancyGrid } from '../slam.utils';

import { useRosConnection } from '@/features/telemetry/shared';
import { createTopicSubscription } from '@/services/ros/subscriber/TopicSubscriber';
import type { ConnectionState } from '@/types';
import type { OccupancyGridMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// useSlamData
// ---------------------------------------------------------------------------

export interface UseSlamDataResult {
  grid: ParsedOccupancyGrid | null;
  connectionState: ConnectionState;
  fetchMap: () => void;
  isLoading: boolean;
}

/**
 * On-demand map fetch hook for nav_msgs/OccupancyGrid.
 *
 * Unlike live-streaming hooks, this hook does NOT subscribe continuously.
 * Calling {@link fetchMap} creates a one-shot subscription: it takes the first
 * message emitted on the map topic then unsubscribes automatically.
 *
 * This pattern is appropriate for large, infrequently-updated SLAM maps where
 * continuous streaming would be unnecessarily expensive.
 */
export function useSlamData(
  robotId: string | undefined,
  topicName: string = MAP_DEFAULT_TOPIC
): UseSlamDataResult {
  const { ros, connectionState } = useRosConnection(robotId);

  const [grid, setGrid] = useState<ParsedOccupancyGrid | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the topic name to avoid closure staleness inside fetchMap
  const topic = useMemo(() => topicName, [topicName]);

  const fetchMap = useCallback(() => {
    if (ros === null) return;
    if (isLoading) return;

    setIsLoading(true);

    const topic$ = createTopicSubscription<OccupancyGridMessage>(
      ros,
      topic,
      MAP_MESSAGE_TYPE
    );

    // Take exactly one message then auto-unsubscribe
    const sub = topic$.pipe(take(1)).subscribe({
      next: (msg) => {
        setGrid(parseOccupancyGrid(msg));
        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
      },
      complete: () => {
        setIsLoading(false);
      },
    });

    // Cleanup if the component unmounts during fetch (not typical for
    // take(1), but good practice)
    return () => sub.unsubscribe();
  }, [ros, topic, isLoading]);

  return { grid, connectionState, fetchMap, isLoading };
}
