import { useCallback, useEffect, useState } from 'react';
import type { Ros } from 'roslib';

/** RosTopic
 * @description A discovered ROS topic with its name and message type.
 */
export interface RosTopic {
  readonly name: string;
  readonly type: string;
}

/** useRosTopics
 * @description Fetches the list of available ROS topics from a live Ros
 *  instance. Re-fetches when the instance changes or on a 10s interval.
 * @param ros - The live Ros instance, or undefined if disconnected.
 */
export function useRosTopics(ros: Ros | undefined): readonly RosTopic[] {
  const [topics, setTopics] = useState<readonly RosTopic[]>([]);

  const fetchTopics = useCallback((instance: Ros) => {
    instance.getTopics(
      (result) => {
        const discovered = result.topics.map((name, i) => ({
          name,
          type: result.types[i] ?? 'unknown',
        }));
        setTopics((prev) => {
          const isSame = prev.length === discovered.length &&
            prev.every((t, i) => t.name === discovered[i]?.name && t.type === discovered[i].type);
          return isSame ? prev : discovered;
        });
      },
      () => {
        // Silently fail — topics will remain empty
      },
    );
  }, []);

  useEffect(() => {
    if (!ros) return;

    fetchTopics(ros);
    const interval = setInterval(() => { fetchTopics(ros); }, 10_000);

    return () => {
      clearInterval(interval);
      setTopics([]);
    };
  }, [ros, fetchTopics]);

  return topics;
}
