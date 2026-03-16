export interface TopicSubscriptionState {
  topicName: string;
  messageType: string;
  isSubscribed: boolean;
  lastMessage: unknown;
  lastMessageAt: number | null;
}
