import type {
  PublishHandle,
  TopicPublisherOptions,
} from './TopicPublisher.types';

import type {
  IRos,
  ITopic,
  ITopicFactory,
} from '@/services/ros/transport/ros.types';

export interface TopicPublisherConstructorOptions {
  ros: IRos;
  topicFactory: ITopicFactory;
}

export class TopicPublisher {
  private readonly ros: IRos;
  private readonly topicFactory: ITopicFactory;
  private readonly activeTopics = new Map<string, ITopic>();

  constructor(options: TopicPublisherConstructorOptions) {
    this.ros = options.ros;
    this.topicFactory = options.topicFactory;
  }

  createTopicPublisher<T>(options: TopicPublisherOptions): PublishHandle<T> {
    const { topicName, messageType } = options;

    const topic = this.topicFactory({
      ros: this.ros,
      name: topicName,
      messageType,
    });

    topic.advertise();
    this.activeTopics.set(topicName, topic);

    return {
      publish: (message: T) => {
        topic.publish(message);
      },
      dispose: () => {
        topic.unadvertise();
        this.activeTopics.delete(topicName);
      },
    };
  }

  getActiveTopic(topicName: string): ITopic | undefined {
    return this.activeTopics.get(topicName);
  }
}
