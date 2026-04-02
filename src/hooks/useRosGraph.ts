import { useCallback, useEffect, useState } from 'react';
import type { Ros } from 'roslib';
import type { RosGraph } from '@/types/ros-graph.types';

/** useRosGraph
 * @description Fetches the ROS computation graph summary from a live Ros
 *  instance. Returns counts and name arrays. Re-fetches on a 10s interval.
 * @param ros - The live Ros instance, or undefined if disconnected.
 */
export function useRosGraph(ros: Ros | undefined): RosGraph | null {
  const [graph, setGraph] = useState<RosGraph | null>(null);

  const fetchGraph = useCallback((instance: Ros) => {
    const result: {
      nodes: string[]; topics: string[]; services: string[]; actions: string[];
    } = { nodes: [], topics: [], services: [], actions: [] };
    let pending = 4;

    function maybeDone() {
      pending -= 1;
      if (pending === 0) {
        setGraph((prev) => {
          // Bail out if counts haven't changed to avoid unnecessary re-renders
          if (
            prev &&
            prev.nodes === result.nodes.length &&
            prev.topics === result.topics.length &&
            prev.services === result.services.length &&
            prev.actions === result.actions.length
          ) return prev;

          return {
            nodes: result.nodes.length,
            nodeNames: result.nodes.sort(),
            topics: result.topics.length,
            topicNames: result.topics.sort(),
            services: result.services.length,
            serviceNames: result.services.sort(),
            actions: result.actions.length,
            actionNames: result.actions.sort(),
          };
        });
      }
    }

    instance.getNodes(
      (nodes) => { result.nodes = nodes; maybeDone(); },
      () => { maybeDone(); },
    );

    instance.getTopics(
      (res) => { result.topics = res.topics; maybeDone(); },
      () => { maybeDone(); },
    );

    instance.getServices(
      (services) => { result.services = services; maybeDone(); },
      () => { maybeDone(); },
    );

    instance.getActionServers(
      (actions) => { result.actions = actions; maybeDone(); },
      () => { maybeDone(); },
    );
  }, []);

  useEffect(() => {
    if (!ros) return;

    fetchGraph(ros);
    const interval = setInterval(() => { fetchGraph(ros); }, 10_000);

    return () => {
      clearInterval(interval);
      setGraph(null);
    };
  }, [ros, fetchGraph]);

  return graph;
}
