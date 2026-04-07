import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Ros } from 'roslib';

import { useRosTopics } from '@/hooks';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { isPanelId, type PanelId } from '@/types/panel.types';

import { DEFAULT_PANEL_TOPICS, PANEL_TOPIC_TYPES } from '../constants';
import type { UseTopicManagerReturn } from './useTopicManager.types';

/** useTopicManager
 * @description Manages topic discovery, filtering, selection, and auto-selection
 *  for workspace panels. Filters available ROS topics by panel type, auto-selects
 *  the first valid topic per panel when topics are discovered, and resets on
 *  robot change.
 * @param robotId - The active robot ID, or undefined when no robot is selected.
 * @param ros - Active roslib connection, or undefined when disconnected.
 * @returns Topic state and setter for panel topic selection.
 */
export function useTopicManager(
  robotId: string | undefined,
  ros: Ros | undefined,
): UseTopicManagerReturn {
  const availableTopics = useRosTopics(ros);
  const robot = useConnectionStore((s) => (robotId ? s.robots[robotId] : undefined));
  const selectedTopics = robot?.selectedTopics ?? DEFAULT_PANEL_TOPICS;
  const setRobotTopic = useConnectionStore((s) => s.setRobotTopic);

  const setTopic = useCallback(
    (panelId: PanelId, topicName: string) => {
      if (robotId) setRobotTopic(robotId, panelId, topicName);
    },
    [robotId, setRobotTopic],
  );

  const filteredTopics = useMemo(
    () => ({
      camera: availableTopics.filter((t) => PANEL_TOPIC_TYPES.camera?.includes(t.type)),
      controls: availableTopics.filter((t) => PANEL_TOPIC_TYPES.controls?.includes(t.type)),
      imu: availableTopics.filter((t) => PANEL_TOPIC_TYPES.imu?.includes(t.type)),
      lidar: availableTopics.filter((t) => PANEL_TOPIC_TYPES.lidar?.includes(t.type)),
      status: [],
      telemetry: availableTopics.filter((t) => PANEL_TOPIC_TYPES.telemetry?.includes(t.type)),
    }),
    [availableTopics],
  );

  // Auto-select first valid topic per panel when topics are discovered
  const autoSelectedRef = useRef(false);
  useEffect(() => {
    if (!robotId || availableTopics.length === 0 || autoSelectedRef.current) return;
    autoSelectedRef.current = true;

    for (const [panelId, topics] of Object.entries(filteredTopics)) {
      if (!isPanelId(panelId) || topics.length === 0) continue;
      const current = selectedTopics[panelId];
      const currentExists = topics.some((t) => t.name === current);
      const firstTopic = topics[0];
      if (!currentExists && firstTopic) {
        setRobotTopic(robotId, panelId, firstTopic.name);
      }
    }
  }, [availableTopics, filteredTopics, robotId, selectedTopics, setRobotTopic]);

  // Reset auto-select flag when robot changes
  useEffect(() => {
    autoSelectedRef.current = false;
  }, [robotId]);

  return { availableTopics, filteredTopics, selectedTopics, setTopic };
}
