import type ROSLIB from 'roslib';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { TopicInfo } from '@/types';

// getTopics$ is a pure Observable factory — no roslib imports needed in the
// implementation, so no module mock is required here.
const { getTopics$ } = await import('./TopicDiscovery');

/**
 * Helper: create a typed mock of getTopics that can be controlled per-test.
 */
function makeMockRos(): {
  ros: { getTopics: ReturnType<typeof vi.fn> } & ROSLIB.Ros;
  callSuccess: (topics: string[], types: string[]) => void;
  callError: (err: string) => void;
} {
  let successCb:
    | ((result: { topics: string[]; types: string[] }) => void)
    | null = null;
  let failCb: ((err: string) => void) | null = null;

  const getTopics = vi.fn(
    (
      cb: (result: { topics: string[]; types: string[] }) => void,
      errCb: (err: string) => void
    ) => {
      successCb = cb;
      failCb = errCb;
    }
  );

  const ros = { getTopics } as unknown as {
    getTopics: typeof getTopics;
  } & ROSLIB.Ros;

  return {
    ros,
    callSuccess(topics, types) {
      successCb?.({ topics, types });
    },
    callError(err) {
      failCb?.(err);
    },
  };
}

describe('getTopics$', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls ros.getTopics when subscribed', () => {
    const { ros } = makeMockRos();

    const subscription = getTopics$(ros).subscribe(() => {
      /* noop */
    });
    expect(ros.getTopics).toHaveBeenCalledOnce();

    subscription.unsubscribe();
  });

  it('maps result to a TopicInfo[] array by zipping topics and types', () => {
    const { ros, callSuccess } = makeMockRos();

    const received: TopicInfo[][] = [];
    getTopics$(ros).subscribe((topics) => received.push(topics));

    callSuccess(
      ['/scan', '/imu'],
      ['sensor_msgs/LaserScan', 'sensor_msgs/Imu']
    );

    expect(received).toEqual([
      [
        { name: '/scan', messageType: 'sensor_msgs/LaserScan' },
        { name: '/imu', messageType: 'sensor_msgs/Imu' },
      ],
    ]);
  });

  it('completes after a single emission', () => {
    const { ros, callSuccess } = makeMockRos();

    let completed = false;
    getTopics$(ros).subscribe({ complete: () => (completed = true) });

    callSuccess(['/scan'], ['sensor_msgs/LaserScan']);

    expect(completed).toBe(true);
  });

  it('handles an empty topics list gracefully', () => {
    const { ros, callSuccess } = makeMockRos();

    const received: TopicInfo[][] = [];
    let completed = false;

    getTopics$(ros).subscribe({
      next: (topics) => received.push(topics),
      complete: () => (completed = true),
    });

    callSuccess([], []);

    expect(received).toEqual([[]]);
    expect(completed).toBe(true);
  });

  it('forwards failedCallback as an error on the subscriber', () => {
    const { ros, callError } = makeMockRos();

    const errors: unknown[] = [];
    getTopics$(ros).subscribe({
      error: (err) => errors.push(err),
    });

    callError('Connection timeout');

    expect(errors).toEqual(['Connection timeout']);
  });
});
