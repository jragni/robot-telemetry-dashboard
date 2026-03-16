import type { TopicSubscriptionState } from '../topic-list.types';

export interface TopicRowProps {
  topic: TopicSubscriptionState;
  onToggle: (topicName: string) => void;
}
