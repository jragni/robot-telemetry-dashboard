/**
 * useTopics Hook
 *
 * Custom hook for discovering available ROS topics from the robot.
 * Fetches topic names and types dynamically.
 */

import { useEffect, useState } from 'react';

import type { TopicInfo } from './definitions';
import { useRosContext } from './RosContext';

interface UseTopicsReturn {
  topics: TopicInfo[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTopics(): UseTopicsReturn {
  const { ros, connectionState } = useRosContext();
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTopics = () => {
    if (!ros || connectionState !== 'connected') {
      setTopics([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      ros.getTopics(
        (result) => {
          // result contains { topics: string[], types: string[] }
          const topicList: TopicInfo[] = result.topics.map(
            (name: string, index: number) => ({
              name,
              type: result.types[index],
            })
          );

          setTopics(topicList);
          setLoading(false);
        },
        (err) => {
          console.error('Failed to fetch topics:', err);
          setError(new Error(err.toString()));
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(err as Error);
      setLoading(false);
    }
  };

  // Fetch topics when connection is established
  useEffect(() => {
    if (connectionState === 'connected' && ros) {
      fetchTopics();
    } else {
      setTopics([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, ros]);

  return {
    topics,
    loading,
    error,
    refetch: fetchTopics,
  };
}
