import { Observable } from 'rxjs';

import type { TopicInfo } from '@/shared/types/ros-messages.types';
import type { MockRos } from '@/test/mocks/roslib.mock';

export interface TopicDiscoveryOptions {
  ros: MockRos;
}

export class TopicDiscovery {
  private readonly ros: MockRos;

  constructor(options: TopicDiscoveryOptions) {
    this.ros = options.ros;
  }

  getTopics$(): Observable<TopicInfo[]> {
    return new Observable<TopicInfo[]>((subscriber) => {
      this.ros.getTopics(
        (result: { topics: string[]; types: string[] }) => {
          const topics: TopicInfo[] = result.topics.map((name, index) => ({
            name,
            type: result.types[index],
          }));
          subscriber.next(topics);
          subscriber.complete();
        },
        (error: string) => {
          subscriber.error(new Error(error));
        }
      );
    });
  }
}
