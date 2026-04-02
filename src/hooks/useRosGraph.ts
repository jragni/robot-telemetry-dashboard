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
          const nodeCount = new Set(result.nodes).size;
          const topicCount = new Set(result.topics).size;
          const serviceCount = new Set(result.services).size;
          const actionCount = new Set(result.actions).size;

          if (
            prev &&
            prev.nodes === nodeCount &&
            prev.topics === topicCount &&
            prev.services === serviceCount &&
            prev.actions === actionCount
          ) return prev;

          const nodeNames = [...new Set(result.nodes)].sort();
          const topicNames = [...new Set(result.topics)].sort();
          const serviceNames = [...new Set(result.services)].sort();
          const actionNames = [...new Set(result.actions)].sort();

          return {
            nodes: nodeNames.length,
            nodeNames,
            topics: topicNames.length,
            topicNames,
            services: serviceNames.length,
            serviceNames,
            actions: actionNames.length,
            actionNames,
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
