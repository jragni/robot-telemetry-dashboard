import { useCallback, useEffect, useState } from 'react';
import type { Ros } from 'roslib';

export interface RosTopic {
  readonly name: string;
  readonly type: string;
}

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
