import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { createControlStore } from '../stores/controlStore';

import { useControlPublisher } from './useControlPublisher';

import { TopicPublisher } from '@/services/ros/publisher/TopicPublisher';
import { useRosStore } from '@/shared/stores/ros/ros.store';
import { MockRos, MockTopic } from '@/test/mocks/roslib.mock';

vi.mock('@/shared/stores/ros/ros.store', () => ({
  useRosStore: vi.fn(),
}));

describe('useControlPublisher', () => {
  let mockRos: MockRos;
  let mockPublisher: TopicPublisher;
  let controlStore: ReturnType<typeof createControlStore>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockRos = new MockRos();
    mockRos.isConnected = true;

    mockPublisher = new TopicPublisher({
      ros: mockRos,
      topicFactory: (opts) => new MockTopic({ ...opts, ros: mockRos }),
    });

    controlStore = createControlStore('robot-1');

    vi.mocked(useRosStore).mockImplementation((selector) => {
      return selector({
        connectionStates: {
          'robot-1': { state: 'connected', error: null },
        },
        setConnectionState: vi.fn(),
        setConnectionError: vi.fn(),
        getConnectionState: vi.fn(),
        removeRobot: vi.fn(),
      });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('starts publishing at 50ms interval when direction is set', () => {
    const publishSpy = vi.fn();
    vi.spyOn(mockPublisher, 'createTopicPublisher').mockReturnValue({
      publish: publishSpy,
      dispose: vi.fn(),
    });

    const { unmount } = renderHook(() =>
      useControlPublisher({
        robotId: 'robot-1',
        controlStore,
        publisher: mockPublisher,
      })
    );

    act(() => {
      controlStore.getState().setDirection('forward');
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // 3 intervals at 50ms each
    expect(publishSpy.mock.calls.length).toBeGreaterThanOrEqual(3);

    unmount();
  });

  it('publishes zero-velocity when direction is cleared', () => {
    const publishSpy = vi.fn();
    vi.spyOn(mockPublisher, 'createTopicPublisher').mockReturnValue({
      publish: publishSpy,
      dispose: vi.fn(),
    });

    const { unmount } = renderHook(() =>
      useControlPublisher({
        robotId: 'robot-1',
        controlStore,
        publisher: mockPublisher,
      })
    );

    act(() => {
      controlStore.getState().setDirection('forward');
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    publishSpy.mockClear();

    act(() => {
      controlStore.getState().setDirection(null);
    });

    // Should publish zeroTwist on direction clear
    expect(publishSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        linear: expect.objectContaining({ x: 0 }),
        angular: expect.objectContaining({ z: 0 }),
      })
    );

    unmount();
  });

  it('auto-activates e-stop on connection loss', () => {
    let connectionState = 'connected' as string;

    vi.mocked(useRosStore).mockImplementation((selector) => {
      return selector({
        connectionStates: {
          'robot-1': { state: connectionState as 'connected', error: null },
        },
        setConnectionState: vi.fn(),
        setConnectionError: vi.fn(),
        getConnectionState: vi.fn(),
        removeRobot: vi.fn(),
      });
    });

    const publishSpy = vi.fn();
    vi.spyOn(mockPublisher, 'createTopicPublisher').mockReturnValue({
      publish: publishSpy,
      dispose: vi.fn(),
    });

    const { rerender, unmount } = renderHook(() =>
      useControlPublisher({
        robotId: 'robot-1',
        controlStore,
        publisher: mockPublisher,
      })
    );

    // Simulate connection loss
    connectionState = 'disconnected';
    vi.mocked(useRosStore).mockImplementation((selector) => {
      return selector({
        connectionStates: {
          'robot-1': { state: 'disconnected', error: null },
        },
        setConnectionState: vi.fn(),
        setConnectionError: vi.fn(),
        getConnectionState: vi.fn(),
        removeRobot: vi.fn(),
      });
    });

    act(() => {
      rerender();
    });

    expect(controlStore.getState().eStopActive).toBe(true);

    unmount();
  });

  it('does not publish when e-stop is active', () => {
    const publishSpy = vi.fn();
    vi.spyOn(mockPublisher, 'createTopicPublisher').mockReturnValue({
      publish: publishSpy,
      dispose: vi.fn(),
    });

    const { unmount } = renderHook(() =>
      useControlPublisher({
        robotId: 'robot-1',
        controlStore,
        publisher: mockPublisher,
      })
    );

    act(() => {
      controlStore.getState().activateEStop();
    });

    publishSpy.mockClear();

    act(() => {
      // Direction set is ignored while e-stop active
      controlStore.getState().setDirection('forward');
      vi.advanceTimersByTime(150);
    });

    // No directional publishes should occur
    const directionalPublishes = publishSpy.mock.calls.filter(
      (call) => (call[0] as { linear: { x: number } }).linear.x !== 0
    );
    expect(directionalPublishes.length).toBe(0);

    unmount();
  });

  it('clears interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const publishSpy = vi.fn();
    vi.spyOn(mockPublisher, 'createTopicPublisher').mockReturnValue({
      publish: publishSpy,
      dispose: vi.fn(),
    });

    const { unmount } = renderHook(() =>
      useControlPublisher({
        robotId: 'robot-1',
        controlStore,
        publisher: mockPublisher,
      })
    );

    act(() => {
      controlStore.getState().setDirection('forward');
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
