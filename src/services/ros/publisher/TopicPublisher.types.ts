export interface TopicPublisherOptions {
  topicName: string;
  messageType: string;
}

export interface PublishHandle<T> {
  publish(message: T): void;
  dispose(): void;
}

export interface ITopicPublisher {
  createTopicPublisher<T>(options: TopicPublisherOptions): PublishHandle<T>;
}
