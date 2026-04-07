import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ros } from 'roslib';
import type { RosGraph } from '@/types/ros-graph.types';

/** useRosGraph
 * @description Polls the ROS graph (nodes, topics, services, actions) every 10 seconds
 *  and returns deduplicated counts and sorted name lists.
 * @param ros - Active roslib connection, or undefined when disconnected.
 */
export function useRosGraph(ros: Ros | undefined): RosGraph | null {
  const [graph, setGraph] = useState<RosGraph | null>(null);

  const abortedRef = useRef(false);

  const fetchGraph = useCallback((instance: Ros) => {
    const result: {
      actions: string[];
      nodes: string[];
      services: string[];
      topics: string[];
    } = { actions: [], nodes: [], services: [], topics: [] };
    let pending = 4;

    function maybeDone() {
      pending -= 1;
      if (pending === 0) {
        if (abortedRef.current) return;
        setGraph((prev) => {
          // Bail out if counts haven't changed to avoid unnecessary re-renders
          const nodeCount = new Set(result.nodes).size;
          const topicCount = new Set(result.topics).size;
          const serviceCount = new Set(result.services).size;
          const actionCount = new Set(result.actions).size;

          if (
            prev?.nodes === nodeCount &&
            prev.topics === topicCount &&
            prev.services === serviceCount &&
            prev.actions === actionCount
          )
            return prev;

          const nodeNames = [...new Set(result.nodes)].sort();
          const topicNames = [...new Set(result.topics)].sort();
          const serviceNames = [...new Set(result.services)].sort();
          const actionNames = [...new Set(result.actions)].sort();

          return {
            actionNames,
            actions: actionNames.length,
            nodeNames,
            nodes: nodeNames.length,
            serviceNames,
            services: serviceNames.length,
            topicNames,
            topics: topicNames.length,
          };
        });
      }
    }

    instance.getNodes(
      (nodes) => {
        result.nodes = nodes;
        maybeDone();
      },
      (err) => {
        console.warn('[useRosGraph] Failed to fetch nodes:', err);
        maybeDone();
      },
    );

    instance.getTopics(
      (res) => {
        result.topics = res.topics;
        maybeDone();
      },
      (err) => {
        console.warn('[useRosGraph] Failed to fetch topics:', err);
        maybeDone();
      },
    );

    instance.getServices(
      (services) => {
        result.services = services;
        maybeDone();
      },
      (err) => {
        console.warn('[useRosGraph] Failed to fetch services:', err);
        maybeDone();
      },
    );

    instance.getActionServers(
      (actions) => {
        result.actions = actions;
        maybeDone();
      },
      (err) => {
        console.warn('[useRosGraph] Failed to fetch actions:', err);
        maybeDone();
      },
    );
  }, []);

  useEffect(() => {
    if (!ros) return;

    abortedRef.current = false;
    fetchGraph(ros);
    const interval = setInterval(() => {
      fetchGraph(ros);
    }, 10_000);

    return () => {
      abortedRef.current = true;
      clearInterval(interval);
      setGraph(null);
    };
  }, [ros, fetchGraph]);

  return graph;
}
