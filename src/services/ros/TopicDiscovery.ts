import type ROSLIB from 'roslib';
import { Observable } from 'rxjs';

import { createLogger } from '@/lib/logger';
import type { TopicInfo } from '@/types';

const log = createLogger('TopicDiscovery');

/**
 * Returns a cold Observable that queries the ROS master for all advertised
 * topics, emits a single `TopicInfo[]` array, and then completes.
 *
 * If the ROS bridge reports an error the Observable errors with that value
 * instead.
 *
 * @param ros Active ROSLIB.Ros connection.
 */
export function getTopics$(ros: ROSLIB.Ros): Observable<TopicInfo[]> {
  return new Observable<TopicInfo[]>((subscriber) => {
    log.debug('Querying ROS master for topic list');

    ros.getTopics(
      (result: { topics: string[]; types: string[] }) => {
        const topicInfos: TopicInfo[] = result.topics.map((name, index) => ({
          name,
          messageType: result.types[index] ?? '',
        }));

        log.debug(`Discovered ${topicInfos.length} topic(s)`);
        subscriber.next(topicInfos);
        subscriber.complete();
      },
      (error: string) => {
        log.error('Failed to retrieve topics', error);
        subscriber.error(error);
      }
    );
  });
}
