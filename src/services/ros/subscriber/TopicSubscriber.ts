import { Observable, throttleTime } from 'rxjs';

import type { TopicSubscriptionOptions } from './TopicSubscriber.types';

import { ROS_CONFIG } from '@/config/ros';
import type { MockRos, MockTopic } from '@/test/mocks/roslib.mock';

interface TopicFactoryOptions {
  ros: MockRos;
  name: string;
  messageType: string;
}

export interface TopicSubscriberOptions {
  ros: MockRos;
  topicFactory: (options: TopicFactoryOptions) => MockTopic;
}

interface ActiveSubscription {
  topic: MockTopic;
  refCount: number;
}

export class TopicSubscriber {
  private readonly ros: MockRos;
  private readonly topicFactory: (options: TopicFactoryOptions) => MockTopic;
  private readonly activeSubscriptions = new Map<string, ActiveSubscription>();

  constructor(options: TopicSubscriberOptions) {
    this.ros = options.ros;
    this.topicFactory = options.topicFactory;
  }

  createTopicSubscription<T>(options: TopicSubscriptionOptions): Observable<T> {
    const { topicName, messageType, throttleMs } = options;
    const effectiveThrottle = throttleMs ?? ROS_CONFIG.throttle.defaultMs;

    // Get or create the active subscription entry
    let entry = this.activeSubscriptions.get(topicName);
    if (!entry) {
      const topic = this.topicFactory({
        ros: this.ros,
        name: topicName,
        messageType,
      });
      entry = { topic, refCount: 0 };
      this.activeSubscriptions.set(topicName, entry);
    }

    const currentEntry = entry;

    const source$ = new Observable<T>((subscriber) => {
      currentEntry.refCount++;

      // Only subscribe to roslib topic on first subscriber
      if (currentEntry.refCount === 1) {
        currentEntry.topic.subscribe((message: unknown) => {
          subscriber.next(message as T);
        });
      }

      return () => {
        currentEntry.refCount--;
        if (currentEntry.refCount <= 0) {
          currentEntry.topic.unsubscribe();
          this.activeSubscriptions.delete(topicName);
        }
      };
    });

    if (effectiveThrottle > 0) {
      return source$.pipe(throttleTime(effectiveThrottle));
    }

    return source$;
  }

  getActiveTopic(topicName: string): MockTopic | undefined {
    return this.activeSubscriptions.get(topicName)?.topic;
  }
}
