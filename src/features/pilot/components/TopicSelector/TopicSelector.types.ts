import type { createControlStore } from '../../stores/controlStore';

import type { TopicInfo } from '@/shared/types/ros-messages.types';

export interface TopicSelectorProps {
  controlStore: ReturnType<typeof createControlStore>;
  availableTopics: TopicInfo[];
}
