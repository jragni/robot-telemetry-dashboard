import type ROSLIB from 'roslib';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { createMockTopic, type MockTopic } from '@/test/mocks/roslib.mock';

let mockTopic: MockTopic;

vi.mock('roslib', () => ({
  default: {
    // Must use `function` keyword so Vitest allows `new ROSLIB.Topic(...)`.
    // eslint-disable-next-line prefer-arrow-callback
    Topic: vi.fn(function () {
      return mockTopic;
    }),
  },
}));

// Import after mock is registered so the module picks up the vi.mock factory.
const { createTopicSubscription } = await import('./TopicSubscriber');

// A minimal stand-in for ROSLIB.Ros — the implementation only passes it to
// the Topic constructor, so the actual shape is irrelevant here.
const mockRos = {} as ROSLIB.Ros;

describe('createTopicSubscription', () => {
  beforeEach(() => {
    mockTopic = createMockTopic('/test');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates ROSLIB.Topic with correct name and messageType', async () => {
    const { default: ROSLIB } = await import('roslib');
    const TopicSpy = vi.mocked(ROSLIB.Topic);

    const sub = createTopicSubscription(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan'
    );
    const subscription = sub.subscribe(() => {
      /* noop */
    });

    expect(TopicSpy).toHaveBeenCalledOnce();
    expect(TopicSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '/scan',
        messageType: 'sensor_msgs/LaserScan',
      })
    );

    subscription.unsubscribe();
  });

  it('calls topic.subscribe when first RxJS subscriber subscribes', () => {
    const obs$ = createTopicSubscription(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan'
    );

    expect(mockTopic.subscribe).not.toHaveBeenCalled();

    const subscription = obs$.subscribe(() => {
      /* noop */
    });
    expect(mockTopic.subscribe).toHaveBeenCalledOnce();

    subscription.unsubscribe();
  });

  it('emits messages from ROSLIB callback to subscriber', () => {
    const obs$ = createTopicSubscription<{ data: number }>(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan'
    );

    const received: { data: number }[] = [];
    const subscription = obs$.subscribe((msg) => received.push(msg));

    mockTopic._emit({ data: 42 });
    mockTopic._emit({ data: 99 });

    expect(received).toEqual([{ data: 42 }, { data: 99 }]);

    subscription.unsubscribe();
  });

  it('calls topic.unsubscribe when last subscriber unsubscribes (refCount teardown)', () => {
    const obs$ = createTopicSubscription(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan'
    );

    const subscription = obs$.subscribe(() => {
      /* noop */
    });
    expect(mockTopic.unsubscribe).not.toHaveBeenCalled();

    subscription.unsubscribe();
    expect(mockTopic.unsubscribe).toHaveBeenCalledOnce();
  });

  it('does NOT call topic.unsubscribe while at least one subscriber is still active', () => {
    const obs$ = createTopicSubscription(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan'
    );

    const sub1 = obs$.subscribe(() => {
      /* noop */
    });
    const sub2 = obs$.subscribe(() => {
      /* noop */
    });

    sub1.unsubscribe();
    expect(mockTopic.unsubscribe).not.toHaveBeenCalled();

    sub2.unsubscribe();
    expect(mockTopic.unsubscribe).toHaveBeenCalledOnce();
  });

  it('replays last value to a late subscriber (shareReplay bufferSize 1)', () => {
    const obs$ = createTopicSubscription<{ data: number }>(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan'
    );

    const sub1 = obs$.subscribe(() => {
      /* noop */
    });
    mockTopic._emit({ data: 7 });

    // Late subscriber should immediately receive the replayed last value.
    const replayed: { data: number }[] = [];
    const sub2 = obs$.subscribe((msg) => replayed.push(msg));

    expect(replayed).toEqual([{ data: 7 }]);

    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('multiple subscribers share the same ROSLIB.Topic (only one subscribe call)', () => {
    const obs$ = createTopicSubscription(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan'
    );

    const sub1 = obs$.subscribe(() => {
      /* noop */
    });
    const sub2 = obs$.subscribe(() => {
      /* noop */
    });
    const sub3 = obs$.subscribe(() => {
      /* noop */
    });

    expect(mockTopic.subscribe).toHaveBeenCalledOnce();

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();
  });

  it('throttles emissions when throttleMs > 0', () => {
    vi.useFakeTimers();

    const obs$ = createTopicSubscription<{ data: number }>(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan',
      { throttleMs: 200 }
    );

    const received: { data: number }[] = [];
    const subscription = obs$.subscribe((msg) => received.push(msg));

    // First emission passes through immediately (leading edge).
    mockTopic._emit({ data: 1 });
    expect(received).toEqual([{ data: 1 }]);

    // These arrive within the throttle window and should be suppressed.
    mockTopic._emit({ data: 2 });
    mockTopic._emit({ data: 3 });
    expect(received).toHaveLength(1);

    // Advance past the throttle window — the last suppressed value is emitted.
    vi.advanceTimersByTime(200);
    expect(received).toHaveLength(2);
    expect(received[1]).toEqual({ data: 3 });

    subscription.unsubscribe();
  });

  it('does not throttle when throttleMs is 0', () => {
    const obs$ = createTopicSubscription<{ data: number }>(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan',
      { throttleMs: 0 }
    );

    const received: { data: number }[] = [];
    const subscription = obs$.subscribe((msg) => received.push(msg));

    mockTopic._emit({ data: 1 });
    mockTopic._emit({ data: 2 });
    mockTopic._emit({ data: 3 });

    expect(received).toEqual([{ data: 1 }, { data: 2 }, { data: 3 }]);

    subscription.unsubscribe();
  });

  it('does not throttle when throttleMs is omitted', () => {
    const obs$ = createTopicSubscription<{ data: number }>(
      mockRos,
      '/scan',
      'sensor_msgs/LaserScan'
    );

    const received: { data: number }[] = [];
    const subscription = obs$.subscribe((msg) => received.push(msg));

    mockTopic._emit({ data: 10 });
    mockTopic._emit({ data: 20 });

    expect(received).toEqual([{ data: 10 }, { data: 20 }]);

    subscription.unsubscribe();
  });
});
