import type { Observable } from 'rxjs';

export interface TopicSubscriptionOptions {
  topicName: string;
  messageType: string;
  throttleMs?: number;
}

export interface ITopicSubscriber {
  createTopicSubscription<T>(options: TopicSubscriptionOptions): Observable<T>;
}
