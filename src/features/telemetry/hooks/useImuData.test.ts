import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { useImuData } from './useImuData';

import { useRosStore } from '@/shared/stores/ros/ros.store';
import { MockRos, MockTopic } from '@/test/mocks/roslib.mock';

vi.mock('@/services/ros/registry/RosServiceRegistry', () => ({
  rosServiceRegistry: {
    get: vi.fn(),
  },
}));

const mockImuMessage = {
  orientation: { x: 0, y: 0, z: 0, w: 1 },
  angular_velocity: { x: 0.1, y: -0.05, z: 0.02 },
  linear_acceleration: { x: 0.01, y: -0.02, z: 9.81 },
};

describe('useImuData', () => {
  let mockRos: MockRos;
  let mockTopic: MockTopic;

  beforeEach(() => {
    vi.useFakeTimers();
    mockRos = new MockRos();
    mockRos.isConnected = true;
    mockTopic = new MockTopic({
      ros: mockRos,
      name: '/imu/data',
      messageType: 'sensor_msgs/Imu',
    });

    // Reset store
    useRosStore.setState({ connectionStates: {} });
    useRosStore.getState().setConnectionState('robot-1', 'connected');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns initial state with no data', () => {
    const { result } = renderHook(() =>
      useImuData('robot-1', '/imu/data', 100)
    );

    expect(result.current.imuData).toBeNull();
    expect(result.current.euler).toBeNull();
    expect(result.current.history).toEqual([]);
  });

  it('updates imuData when message is received', async () => {
    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => mockRos,
    } as never);

    const { result } = renderHook(() => useImuData('robot-1', '/imu/data', 0));

    act(() => {
      mockTopic.simulateMessage(mockImuMessage);
    });

    expect(result.current.imuData).not.toBeNull();
  });

  it('computes euler angles from quaternion', async () => {
    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => mockRos,
    } as never);

    const { result } = renderHook(() => useImuData('robot-1', '/imu/data', 0));

    act(() => {
      mockTopic.simulateMessage(mockImuMessage);
    });

    // Identity quaternion → all zeros
    expect(result.current.euler).not.toBeNull();
    expect(result.current.euler?.roll).toBeCloseTo(0, 4);
    expect(result.current.euler?.pitch).toBeCloseTo(0, 4);
    expect(result.current.euler?.yaw).toBeCloseTo(0, 4);
  });

  it('pushes euler values to history ring buffer', async () => {
    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => mockRos,
    } as never);

    const { result } = renderHook(() => useImuData('robot-1', '/imu/data', 0));

    act(() => {
      mockTopic.simulateMessage(mockImuMessage);
      mockTopic.simulateMessage(mockImuMessage);
    });

    expect(result.current.history.length).toBeGreaterThan(0);
  });

  it('returns null euler when no data received', () => {
    const { result } = renderHook(() =>
      useImuData('robot-1', '/imu/data', 100)
    );
    expect(result.current.euler).toBeNull();
  });

  it('unsubscribes on unmount (no memory leak)', async () => {
    const { rosServiceRegistry } = await import(
      '@/services/ros/registry/RosServiceRegistry'
    );
    const unsubscribeSpy = vi.spyOn(mockTopic, 'unsubscribe');
    vi.mocked(rosServiceRegistry.get).mockReturnValue({
      getRos: () => mockRos,
    } as never);

    const { unmount } = renderHook(() => useImuData('robot-1', '/imu/data', 0));

    unmount();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
