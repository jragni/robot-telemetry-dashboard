import { firstValueFrom, take, toArray } from 'rxjs';
import { describe, expect, it, beforeEach } from 'vitest';

import { TopicSubscriber } from './TopicSubscriber';

import { MockRos, MockTopic } from '@/test/mocks/roslib.mock';

describe('TopicSubscriber', () => {
  let mockRos: MockRos;
  let subscriber: TopicSubscriber;

  beforeEach(() => {
    mockRos = new MockRos();
    mockRos.isConnected = true;
    subscriber = new TopicSubscriber({
      ros: mockRos,
      topicFactory: (options) => new MockTopic({ ...options, ros: mockRos }),
    });
  });

  it('createTopicSubscription() returns an Observable', () => {
    const obs$ = subscriber.createTopicSubscription({
      topicName: '/imu/data',
      messageType: 'sensor_msgs/Imu',
    });

    expect(obs$).toBeDefined();
    expect(typeof obs$.subscribe).toBe('function');
  });

  it('subscribing emits messages from topic', async () => {
    const obs$ = subscriber.createTopicSubscription<{ data: number }>({
      topicName: '/imu/data',
      messageType: 'sensor_msgs/Imu',
      throttleMs: 0, // disable throttle for test
    });

    const messagesPromise = firstValueFrom(obs$.pipe(take(2), toArray()));

    // Get the mock topic and simulate messages
    const topic = subscriber.getActiveTopic('/imu/data')!;
    topic.simulateMessage({ data: 1 });
    topic.simulateMessage({ data: 2 });

    const messages = await messagesPromise;
    expect(messages).toEqual([{ data: 1 }, { data: 2 }]);
  });

  it('throttle limits emission rate', () => {
    const obs$ = subscriber.createTopicSubscription<{ data: number }>({
      topicName: '/scan',
      messageType: 'sensor_msgs/LaserScan',
      throttleMs: 500,
    });

    const received: { data: number }[] = [];
    const sub = obs$.subscribe((msg) => received.push(msg));

    const topic = subscriber.getActiveTopic('/scan')!;

    // Fire many messages rapidly — throttle should limit
    topic.simulateMessage({ data: 1 });
    topic.simulateMessage({ data: 2 });
    topic.simulateMessage({ data: 3 });

    // Only the first should pass through immediately with leading throttle
    expect(received.length).toBe(1);
    expect(received[0]).toEqual({ data: 1 });

    sub.unsubscribe();
  });

  it('unsubscribe cleans up roslib Topic', () => {
    const obs$ = subscriber.createTopicSubscription({
      topicName: '/imu/data',
      messageType: 'sensor_msgs/Imu',
      throttleMs: 0,
    });

    const sub = obs$.subscribe();
    const topic = subscriber.getActiveTopic('/imu/data');
    expect(topic).toBeDefined();

    sub.unsubscribe();

    // After all subscribers unsubscribe, topic should be cleaned up
    expect(subscriber.getActiveTopic('/imu/data')).toBeUndefined();
  });

  it('multiple subscribers share the same underlying subscription (shareReplay)', () => {
    const obs$ = subscriber.createTopicSubscription({
      topicName: '/imu/data',
      messageType: 'sensor_msgs/Imu',
      throttleMs: 0,
    });

    const sub1 = obs$.subscribe();
    const sub2 = obs$.subscribe();

    // Should be the same topic instance
    const topic = subscriber.getActiveTopic('/imu/data');
    expect(topic).toBeDefined();

    // Unsubscribing one should not clean up
    sub1.unsubscribe();
    expect(subscriber.getActiveTopic('/imu/data')).toBeDefined();

    // Unsubscribing all should clean up
    sub2.unsubscribe();
    expect(subscriber.getActiveTopic('/imu/data')).toBeUndefined();
  });
});
