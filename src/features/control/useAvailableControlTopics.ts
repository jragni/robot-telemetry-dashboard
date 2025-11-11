/**
 * useAvailableControlTopics Hook
 *
 * Fetches available ROS topics that publish geometry_msgs/msg/Twist messages
 * (typically cmd_vel topics for robot control).
 */

import { useEffect, useState } from 'react';

import { CMD_VEL_MESSAGE_TYPE } from './constants';

import { useRosContext } from '@/features/ros/RosContext';

export interface ControlTopic {
  label: string;
  value: string;
}

interface UseAvailableControlTopicsReturn {
  topics: ControlTopic[];
  isLoading: boolean;
  error: Error | null;
}

export function useAvailableControlTopics(): UseAvailableControlTopicsReturn {
  const { ros, connectionState } = useRosContext();
  const [topics, setTopics] = useState<ControlTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ros || connectionState !== 'connected') {
      // Not connected, use fallback
      setTopics([{ label: '/cmd_vel', value: '/cmd_vel' }]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Fetch topics and types from ROS
    ros.getTopicsAndRawTypes(
      (result: {
        topics: string[];
        types: string[];
        typedefs_full_text: string[];
      }) => {
        try {
          const controlTopics: ControlTopic[] = [];

          // Filter for Twist message type topics
          result.topics.forEach((topicName, index) => {
            const topicType = result.types[index];

            // Match geometry_msgs/msg/Twist or geometry_msgs/Twist
            if (
              topicType === CMD_VEL_MESSAGE_TYPE ||
              topicType === 'geometry_msgs/Twist'
            ) {
              // Use actual topic name as label
              controlTopics.push({
                label: topicName,
                value: topicName,
              });
            }
          });

          // Sort topics: /cmd_vel first, then alphabetically
          controlTopics.sort((a, b) => {
            if (a.value === '/cmd_vel') return -1;
            if (b.value === '/cmd_vel') return 1;
            return a.value.localeCompare(b.value);
          });

          // Fallback if no topics found
          if (controlTopics.length === 0) {
            setTopics([{ label: '/cmd_vel', value: '/cmd_vel' }]);
          } else {
            setTopics(controlTopics);
          }

          setIsLoading(false);
        } catch (err) {
          console.error('Error processing topics:', err);
          setError(err as Error);
          setTopics([{ label: '/cmd_vel', value: '/cmd_vel' }]);
          setIsLoading(false);
        }
      },
      (err: string | Error) => {
        console.error('Failed to fetch topics:', err);
        const error = typeof err === 'string' ? new Error(err) : err;
        setError(error);
        setTopics([{ label: '/cmd_vel', value: '/cmd_vel' }]);
        setIsLoading(false);
      }
    );
  }, [ros, connectionState]);

  return { topics, isLoading, error };
}
