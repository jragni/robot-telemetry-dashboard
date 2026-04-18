import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { type Ros, Topic } from 'roslib';

import { useRosSubscriber } from './useRosSubscriber';
import type { SubscriberOptions } from './types';

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

  describe('guard clauses — skips subscription for invalid inputs', () => {
    it('does not create a Topic when topicName is empty', () => {
      renderHook(() => useRosSubscriber(fakeRos, '', 'sensor_msgs/msg/Imu', vi.fn()));

      expect(Topic).not.toHaveBeenCalled();
    });

    it('does not create a Topic when messageType is empty', () => {
      renderHook(() => useRosSubscriber(fakeRos, '/imu', '', vi.fn()));

      expect(Topic).not.toHaveBeenCalled();
    });

    it('does not create a Topic when both topicName and messageType are empty', () => {
      renderHook(() => useRosSubscriber(undefined, '', '', vi.fn()));

      expect(Topic).not.toHaveBeenCalled();
    });
  });

  describe('re-subscription on dependency changes', () => {
    it('unsubscribes and resubscribes when topicName changes', () => {
      const { rerender } = renderHook(
        ({ topic }: { topic: string }) =>
          useRosSubscriber(fakeRos, topic, 'sensor_msgs/msg/Imu', vi.fn()),
        { initialProps: { topic: '/imu' } },
      );

      expect(Topic).toHaveBeenCalledTimes(1);
      expect(capturedOptions.name).toBe('/imu');

      rerender({ topic: '/odom' });

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      expect(Topic).toHaveBeenCalledTimes(2);
      expect(capturedOptions.name).toBe('/odom');
    });

    it('unsubscribes and resubscribes when messageType changes', () => {
      const { rerender } = renderHook(
        ({ msgType }: { msgType: string }) => useRosSubscriber(fakeRos, '/data', msgType, vi.fn()),
        { initialProps: { msgType: 'sensor_msgs/msg/Imu' } },
      );

      expect(Topic).toHaveBeenCalledTimes(1);

      rerender({ msgType: 'nav_msgs/msg/Odometry' });

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      expect(Topic).toHaveBeenCalledTimes(2);
      expect(capturedOptions.messageType).toBe('nav_msgs/msg/Odometry');
    });

    it('unsubscribes and resubscribes when throttleRate changes', () => {
      const { rerender } = renderHook(
        ({ rate }: { rate: number }) =>
          useRosSubscriber(fakeRos, '/imu', 'sensor_msgs/msg/Imu', vi.fn(), {
            throttleRate: rate,
          }),
        { initialProps: { rate: 100 } },
      );

      expect(capturedOptions.throttle_rate).toBe(100);

      rerender({ rate: 200 });

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      expect(Topic).toHaveBeenCalledTimes(2);
      expect(capturedOptions.throttle_rate).toBe(200);
    });

    it('unsubscribes and resubscribes when compression changes', () => {
      const { rerender } = renderHook(
        ({ comp }: { comp: 'cbor' | 'none' }) =>
          useRosSubscriber(fakeRos, '/imu', 'sensor_msgs/msg/Imu', vi.fn(), {
            compression: comp,
          }),
        { initialProps: { comp: 'cbor' as 'cbor' | 'none' } },
      );

      expect(capturedOptions.compression).toBe('cbor');

      rerender({ comp: 'none' });

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      expect(Topic).toHaveBeenCalledTimes(2);
      expect(capturedOptions.compression).toBe('none');
    });

    it('cleans up old subscription when ros becomes undefined (disconnect)', () => {
      const { rerender } = renderHook(
        ({ ros }: { ros: Ros | undefined }) =>
          useRosSubscriber(ros, '/imu', 'sensor_msgs/msg/Imu', vi.fn()),
        { initialProps: { ros: fakeRos as Ros | undefined } },
      );

      expect(Topic).toHaveBeenCalledTimes(1);

      rerender({ ros: undefined });

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      expect(Topic).toHaveBeenCalledTimes(1);
    });
  });

  describe('callback ref — always uses latest callback', () => {
    it('invokes the latest callback, not the stale one from initial render', () => {
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      let subscribeFn: ((msg: unknown) => void) | undefined;
      mockSubscribe.mockImplementation((cb: (msg: unknown) => void) => {
        subscribeFn = cb;
      });

      const { rerender } = renderHook(
        ({ cb }: { cb: (msg: unknown) => void }) =>
          useRosSubscriber(fakeRos, '/test', 'std_msgs/msg/String', cb),
        { initialProps: { cb: firstCallback } },
      );

      rerender({ cb: secondCallback });

      subscribeFn?.({ data: 'late-message' });

      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledWith({ data: 'late-message' });
    });
  });

  describe('edge cases', () => {
    it('passes throttle_rate: 0 without omitting it', () => {
      renderHook(() =>
        useRosSubscriber(fakeRos, '/imu', 'sensor_msgs/msg/Imu', vi.fn(), {
          throttleRate: 0,
        }),
      );

      expect(capturedOptions.throttle_rate).toBe(0);
    });

    it('does not resubscribe when callback identity changes but deps are stable', () => {
      const { rerender } = renderHook(
        ({ cb }: { cb: (msg: unknown) => void }) =>
          useRosSubscriber(fakeRos, '/imu', 'sensor_msgs/msg/Imu', cb),
        { initialProps: { cb: vi.fn() } },
      );

      expect(Topic).toHaveBeenCalledTimes(1);

      rerender({ cb: vi.fn() });

      // Should NOT unsubscribe/resubscribe — callback is stored in a ref
      expect(Topic).toHaveBeenCalledTimes(1);
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it('passes all options together correctly', () => {
      const options: SubscriberOptions = {
        compression: 'none',
        queueLength: 10,
        throttleRate: 500,
      };

      renderHook(() =>
        useRosSubscriber(fakeRos, '/scan', 'sensor_msgs/msg/LaserScan', vi.fn(), options),
      );

      expect(capturedOptions.compression).toBe('none');
      expect(capturedOptions.queue_length).toBe(10);
      expect(capturedOptions.throttle_rate).toBe(500);
      expect(capturedOptions.name).toBe('/scan');
      expect(capturedOptions.messageType).toBe('sensor_msgs/msg/LaserScan');
      expect(capturedOptions.ros).toBe(fakeRos);
    });
  });
});
