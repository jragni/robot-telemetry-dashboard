import ROSLIB from 'roslib';
import { Observable, asyncScheduler } from 'rxjs';
import { shareReplay, throttleTime } from 'rxjs/operators';

import { createLogger } from '@/lib/logger';

const log = createLogger('TopicSubscriber');

export interface TopicSubscriptionOptions {
  throttleMs?: number;
}

export const TOPIC_THROTTLE_MS = {
  LIDAR: 200,
  IMU: 100,
  ODOMETRY: 100,
  BATTERY: 1000,
  MAP: 0,
} as const;

/**
 * Creates a shared, ref-counted RxJS Observable that bridges a ROSLIB topic
 * subscription.
 *
 * - The underlying ROSLIB.Topic is created and subscribed lazily when the
 *   first RxJS subscriber subscribes, and unsubscribed when the last one
 *   unsubscribes (shareReplay refCount).
 * - The last emitted value is replayed to any late subscriber (bufferSize: 1).
 * - An optional throttle (leading + trailing) can be applied to cap the
 *   emission rate for high-frequency topics.
 *
 * @param ros         Active ROSLIB.Ros connection.
 * @param topicName   ROS topic name, e.g. `/scan`.
 * @param messageType ROS message type, e.g. `sensor_msgs/LaserScan`.
 * @param options     Optional configuration including `throttleMs`.
 */
export function createTopicSubscription<T>(
  ros: ROSLIB.Ros,
  topicName: string,
  messageType: string,
  options: TopicSubscriptionOptions = {}
): Observable<T> {
  const raw$ = new Observable<T>((subscriber) => {
    log.debug(`Subscribing to topic ${topicName} (${messageType})`);

    const topic = new ROSLIB.Topic({ ros, name: topicName, messageType });

    topic.subscribe((message: unknown) => {
      subscriber.next(message as T);
    });

    return () => {
      log.debug(`Unsubscribing from topic ${topicName}`);
      topic.unsubscribe();
    };
  });

  const { throttleMs } = options;

  const throttled$ =
    throttleMs !== undefined && throttleMs > 0
      ? raw$.pipe(
          throttleTime(throttleMs, asyncScheduler, {
            leading: true,
            trailing: true,
          })
        )
      : raw$;

  return throttled$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
}
