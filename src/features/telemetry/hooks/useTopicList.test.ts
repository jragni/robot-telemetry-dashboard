import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { useTopicList } from './useTopicList';

import { useRosStore } from '@/shared/stores/ros/ros.store';
import { MockRos } from '@/test/mocks/roslib.mock';

vi.mock('@/services/ros/registry/RosServiceRegistry', () => ({
  rosServiceRegistry: {
    get: vi.fn(),
  },
}));

describe('useTopicList', () => {
  let mockRos: MockRos;

  beforeEach(() => {
    vi.useFakeTimers();
    mockRos = new MockRos();
    mockRos.isConnected = true;
    useRosStore.setState({ connectionStates: {} });
    useRosStore.getState().setConnectionState('robot-1', 'connected');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns initial empty topics list', () => {
    const { result } = renderHook(() => useTopicList('robot-1'));

    expect(result.current.topics).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches and returns topic list on mount when connected', async () => {
    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => mockRos,
    } as never);

    const { result } = renderHook(() => useTopicList('robot-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.topics).toHaveLength(3);
    expect(result.current.topics[0]).toEqual({
      name: '/cmd_vel',
      type: 'geometry_msgs/Twist',
    });
  });

  it('topic list includes name and type for each topic', async () => {
    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => mockRos,
    } as never);

    const { result } = renderHook(() => useTopicList('robot-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    for (const topic of result.current.topics) {
      expect(topic).toHaveProperty('name');
      expect(topic).toHaveProperty('type');
    }
  });

  it('re-fetches topics every 5 seconds when no topics returned', async () => {
    const emptyRos = new MockRos();
    emptyRos.isConnected = true;
    emptyRos.getTopics = (callback) => {
      callback({ topics: [], types: [] });
    };

    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => emptyRos,
    } as never);

    const getTopicsSpy = vi.spyOn(emptyRos, 'getTopics');

    renderHook(() => useTopicList('robot-1'));

    // Initial fetch
    await waitFor(() => expect(getTopicsSpy).toHaveBeenCalledTimes(1));

    // Advance 5 seconds — should re-fetch
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(getTopicsSpy).toHaveBeenCalledTimes(2);
  });

  it('re-fetches topics on reconnect', async () => {
    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => mockRos,
    } as never);

    const getTopicsSpy = vi.spyOn(mockRos, 'getTopics');

    renderHook(() => useTopicList('robot-1'));

    await waitFor(() => expect(getTopicsSpy).toHaveBeenCalledTimes(1));

    // Simulate reconnect
    act(() => {
      useRosStore.getState().setConnectionState('robot-1', 'disconnected');
      useRosStore.getState().setConnectionState('robot-1', 'connected');
    });

    await waitFor(() => expect(getTopicsSpy).toHaveBeenCalledTimes(2));
  });

  it('sets isLoading=false after fetch completes', async () => {
    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => mockRos,
    } as never);

    const { result } = renderHook(() => useTopicList('robot-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('exposes error state on fetch failure', async () => {
    const errorRos = new MockRos();
    errorRos.isConnected = false; // Will trigger error path

    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => errorRos,
    } as never);

    const { result } = renderHook(() => useTopicList('robot-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
  });
});
