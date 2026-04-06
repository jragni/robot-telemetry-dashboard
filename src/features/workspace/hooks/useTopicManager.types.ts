import type { RosTopic } from '@/hooks/useRosTopics';
import type { PanelId } from '@/types/panel.types';

export interface FilteredTopics {
  readonly camera: readonly RosTopic[];
  readonly controls: readonly RosTopic[];
  readonly imu: readonly RosTopic[];
  readonly lidar: readonly RosTopic[];
  readonly telemetry: readonly RosTopic[];
}

export interface UseTopicManagerReturn {
  readonly availableTopics: readonly RosTopic[];
  readonly filteredTopics: FilteredTopics;
  readonly selectedTopics: Partial<Record<PanelId, string>>;
  readonly setTopic: (panelId: PanelId, topicName: string) => void;
}
