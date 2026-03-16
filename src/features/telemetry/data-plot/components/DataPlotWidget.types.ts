import type { TopicInfo } from '@/types/ros-messages';

export interface TopicSelectorProps {
  robotId: string | undefined;
  selected: TopicInfo | null;
  onSelect: (topic: TopicInfo | null) => void;
}
