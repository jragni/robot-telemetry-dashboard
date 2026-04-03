import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Ros } from 'roslib';
import { ZERO_TWIST } from './constants';
import { useControlPublisher } from './useControlPublisher';

const { mockPublish } = vi.hoisted(() => {
  const mockPublish = vi.fn();
  return { mockPublish };
});

vi.mock('roslib', () => ({
  Topic: class MockTopic {
    publish = mockPublish;
  },
}));

function createMockRos(): Ros {
  return {} as unknown as Ros;
}

describe('useControlPublisher', () => {
  beforeEach(() => {
    mockPublish.mockClear();
  });

  it('publishes ZERO_TWIST on unmount when a direction was active', () => {
    const ros = createMockRos();
    const onPublish = vi.fn();
    const { result, unmount } = renderHook(() =>
      useControlPublisher({ ros, onPublish }),
    );

    act(() => {
      result.current.handleDirectionStart('forward');
    });

    expect(onPublish).toHaveBeenCalled();
    mockPublish.mockClear();
    onPublish.mockClear();

    unmount();

    expect(mockPublish).toHaveBeenCalledWith(ZERO_TWIST);
    expect(onPublish).toHaveBeenCalledWith(ZERO_TWIST);
  });

  it('publishes ZERO_TWIST on unmount with no active direction', () => {
    const ros = createMockRos();
    const { unmount } = renderHook(() =>
      useControlPublisher({ ros }),
    );

    mockPublish.mockClear();

    unmount();

    expect(mockPublish).toHaveBeenCalledWith(ZERO_TWIST);
  });

  it('clears publish interval on unmount', () => {
    vi.useFakeTimers();

    const ros = createMockRos();
    const { result, unmount } = renderHook(() =>
      useControlPublisher({ ros }),
    );

    act(() => {
      result.current.handleDirectionStart('forward');
    });

    mockPublish.mockClear();
    unmount();

    const callCountAfterUnmount = mockPublish.mock.calls.length;

    vi.advanceTimersByTime(1000);

    expect(mockPublish.mock.calls.length).toBe(callCountAfterUnmount);

    vi.useRealTimers();
  });

  it('publishes ZERO_TWIST before topic is destroyed', () => {
    const publishOrder: string[] = [];

    const ros = createMockRos();
    const onPublish = vi.fn();
    const { result, unmount } = renderHook(() =>
      useControlPublisher({ ros, onPublish }),
    );

    act(() => {
      result.current.handleDirectionStart('left');
    });

    publishOrder.length = 0;
    mockPublish.mockClear();
    onPublish.mockClear();

    mockPublish.mockImplementation(() => {
      publishOrder.push('topic.publish');
    });
    onPublish.mockImplementation(() => {
      publishOrder.push('onPublish');
    });

    unmount();

    // topic.publish was called, proving topicRef was still valid when cleanup ran
    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledWith(ZERO_TWIST);
    expect(onPublish).toHaveBeenCalledWith(ZERO_TWIST);
    expect(publishOrder).toContain('topic.publish');
  });

  it('does not error when unmounting without a ros instance', () => {
    const { unmount } = renderHook(() =>
      useControlPublisher(),
    );

    expect(() => unmount()).not.toThrow();
    expect(mockPublish).not.toHaveBeenCalled();
  });
});
