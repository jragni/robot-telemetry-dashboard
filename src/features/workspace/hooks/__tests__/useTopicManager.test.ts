import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSetRobotTopic = vi.fn();
let mockRobots: Record<string, { selectedTopics: Record<string, string> }> = {};

vi.mock('@/stores/connection/useConnectionStore', () => ({
  useConnectionStore: vi.fn((selector: (s: unknown) => unknown) =>
    selector({
      robots: mockRobots,
      setRobotTopic: mockSetRobotTopic,
    }),
  ),
}));

vi.mock('@/hooks/useRosTopics', () => ({
  useRosTopics: vi.fn(() => []),
}));

const { useRosTopics } = await import('@/hooks/useRosTopics');
const mockedUseRosTopics = vi.mocked(useRosTopics);

import { useTopicManager } from '../useTopicManager';

const ROBOT_ID = 'test-bot-01';

describe('useTopicManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRobots = {};
    mockedUseRosTopics.mockReturnValue([]);
  });

  it('returns empty filteredTopics when no topics are available', () => {
    const { result } = renderHook(() => useTopicManager(ROBOT_ID, undefined));

    expect(result.current.availableTopics).toEqual([]);
    expect(result.current.filteredTopics.camera).toEqual([]);
    expect(result.current.filteredTopics.controls).toEqual([]);
    expect(result.current.filteredTopics.imu).toEqual([]);
    expect(result.current.filteredTopics.lidar).toEqual([]);
    expect(result.current.filteredTopics.telemetry).toEqual([]);
  });

  it('filters topics by panel type', () => {
    const mockTopics = [
      { name: '/scan', type: 'sensor_msgs/msg/LaserScan' },
      { name: '/imu/data', type: 'sensor_msgs/msg/Imu' },
      { name: '/camera/image', type: 'sensor_msgs/msg/CompressedImage' },
      { name: '/cmd_vel', type: 'geometry_msgs/msg/Twist' },
      { name: '/odom', type: 'nav_msgs/msg/Odometry' },
    ];
    mockedUseRosTopics.mockReturnValue(mockTopics);

    const { result } = renderHook(() => useTopicManager(ROBOT_ID, undefined));

    expect(result.current.filteredTopics.lidar).toEqual([mockTopics[0]]);
    expect(result.current.filteredTopics.imu).toEqual([mockTopics[1]]);
    expect(result.current.filteredTopics.camera).toEqual([mockTopics[2]]);
    expect(result.current.filteredTopics.controls).toEqual([mockTopics[3]]);
    expect(result.current.filteredTopics.telemetry.length).toBeGreaterThan(0);
  });

  it('calls setRobotTopic when setTopic is invoked with a valid robotId', () => {
    const { result } = renderHook(() => useTopicManager(ROBOT_ID, undefined));

    act(() => {
      result.current.setTopic('lidar', '/scan2');
    });

    expect(mockSetRobotTopic).toHaveBeenCalledWith(ROBOT_ID, 'lidar', '/scan2');
  });

  it('does not call setRobotTopic when robotId is undefined', () => {
    const { result } = renderHook(() => useTopicManager(undefined, undefined));

    act(() => {
      result.current.setTopic('lidar', '/scan2');
    });

    expect(mockSetRobotTopic).not.toHaveBeenCalled();
  });

  it('returns selectedTopics from the robot in the store', () => {
    const topics = { camera: '/cam1', lidar: '/scan' };
    mockRobots[ROBOT_ID] = { selectedTopics: topics };

    const { result } = renderHook(() => useTopicManager(ROBOT_ID, undefined));

    expect(result.current.selectedTopics).toEqual(topics);
  });

  it('returns DEFAULT_PANEL_TOPICS when robot is not in the store', () => {
    const { result } = renderHook(() => useTopicManager('nonexistent', undefined));

    expect(result.current.selectedTopics).toBeDefined();
    expect(typeof result.current.selectedTopics).toBe('object');
  });
});
