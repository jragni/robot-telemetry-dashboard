import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Topic } from 'roslib';

import { useRosSubscriber } from './useRosSubscriber';
import type { SubscriberOptions } from './useRosSubscriber.types';

const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();
let capturedOptions: Record<string, unknown> = {};

vi.mock('roslib', () => {
  const MockTopic = vi.fn(function (this: Record<string, unknown>, opts: Record<string, unknown>) {
    capturedOptions = opts;
    this.subscribe = mockSubscribe;
    this.unsubscribe = mockUnsubscribe;
  });
  return { Topic: MockTopic };
});

const fakeRos = { on: vi.fn() } as never;

describe('useRosSubscriber', () => {
  beforeEach(() => {
    capturedOptions = {};
    mockSubscribe.mockClear();
    mockUnsubscribe.mockClear();
    vi.mocked(Topic).mockClear();
  });

  it('creates Topic with CBOR compression and queue_length 1 by default', () => {
    renderHook(() => useRosSubscriber(fakeRos, '/imu', 'sensor_msgs/msg/Imu', vi.fn()));

    expect(capturedOptions.compression).toBe('cbor');
    expect(capturedOptions.queue_length).toBe(1);
    expect(capturedOptions.throttle_rate).toBeUndefined();
  });

  it('passes throttle_rate when throttleRate option is provided', () => {
    const options: SubscriberOptions = { throttleRate: 100 };
    renderHook(() => useRosSubscriber(fakeRos, '/imu', 'sensor_msgs/msg/Imu', vi.fn(), options));

    expect(capturedOptions.throttle_rate).toBe(100);
  });

  it('respects compression override', () => {
    const options: SubscriberOptions = { compression: 'none' };
    renderHook(() => useRosSubscriber(fakeRos, '/imu', 'sensor_msgs/msg/Imu', vi.fn(), options));

    expect(capturedOptions.compression).toBe('none');
  });

  it('respects queueLength override', () => {
    const options: SubscriberOptions = { queueLength: 5 };
    renderHook(() => useRosSubscriber(fakeRos, '/imu', 'sensor_msgs/msg/Imu', vi.fn(), options));

    expect(capturedOptions.queue_length).toBe(5);
  });

  it('does not create a Topic when ros is undefined', () => {
    renderHook(() => useRosSubscriber(undefined, '/imu', 'sensor_msgs/msg/Imu', vi.fn()));

    expect(Topic).not.toHaveBeenCalled();
  });

  it('subscribes to the topic and calls the callback on message', () => {
    const onMessage = vi.fn();
    mockSubscribe.mockImplementation((cb: (msg: unknown) => void) => {
      cb({ data: 'test' });
    });

    renderHook(() => useRosSubscriber(fakeRos, '/test', 'std_msgs/msg/String', onMessage));

    expect(mockSubscribe).toHaveBeenCalled();
    expect(onMessage).toHaveBeenCalledWith({ data: 'test' });
  });

  it('unsubscribes on cleanup', () => {
    const { unmount } = renderHook(() =>
      useRosSubscriber(fakeRos, '/test', 'std_msgs/msg/String', vi.fn()),
    );

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
