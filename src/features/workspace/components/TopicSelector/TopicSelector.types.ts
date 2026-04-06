import type { RosTopic } from '@/hooks';

export interface TopicSelectorProps {
  readonly topicName: string;
  readonly availableTopics?: readonly RosTopic[];
  readonly onTopicChange?: (topicName: string) => void;
}
