import type { TopicInfo } from '@/types';

export interface TopicSelectorProps {
  robotId: string | undefined;
  selected: TopicInfo | null;
  onSelect: (topic: TopicInfo | null) => void;
}
