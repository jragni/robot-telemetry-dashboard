import type {
  PublishHandle,
  TopicPublisherOptions,
} from './TopicPublisher.types';

import type { MockRos, MockTopic } from '@/test/mocks/roslib.mock';

interface TopicFactoryOptions {
  ros: MockRos;
  name: string;
  messageType: string;
}

export interface TopicPublisherConstructorOptions {
  ros: MockRos;
  topicFactory: (options: TopicFactoryOptions) => MockTopic;
}

export class TopicPublisher {
  private readonly ros: MockRos;
  private readonly topicFactory: (options: TopicFactoryOptions) => MockTopic;
  private readonly activeTopics = new Map<string, MockTopic>();

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

  getActiveTopic(topicName: string): MockTopic | undefined {
    return this.activeTopics.get(topicName);
  }
}
