import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage before importing the store (persist middleware needs it)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

vi.mock('@/lib/rosbridge/ConnectionManager', () => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  getConnection: vi.fn(),
  testConnection: vi.fn(),
  getConnectedAt: vi.fn(),
}));

// Import after mocks are in place
const { useConnectionStore } = await import('../useConnectionStore');

describe('useConnectionStore actions', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useConnectionStore.setState({ robots: {} });
  });

  describe('addRobot', () => {
    it('creates an entry with correct ID, name, url, and disconnected status', () => {
      useConnectionStore.getState().addRobot('Test Bot', 'ws://192.168.1.10');

      const robots = useConnectionStore.getState().robots;
      const robot = robots['test-bot'];

      expect(robot).toBeDefined();
      expect(robot?.id).toBe('test-bot');
      expect(robot?.name).toBe('Test Bot');
      expect(robot?.url).toBe('ws://192.168.1.10');
      expect(robot?.status).toBe('disconnected');
      expect(robot?.lastSeen).toBeNull();
      expect(robot?.lastError).toBeNull();
    });

    it('derives ID by lowercasing and replacing spaces with hyphens', () => {
      useConnectionStore.getState().addRobot('My Cool Robot', 'ws://localhost:9090');

      const robots = useConnectionStore.getState().robots;
      expect(robots['my-cool-robot']).toBeDefined();
    });

    it('assigns a color to the robot', () => {
      useConnectionStore.getState().addRobot('Alpha', 'ws://10.0.0.1');

      const robot = useConnectionStore.getState().robots['alpha'];
      expect(robot?.color).toBeDefined();
      expect(typeof robot?.color).toBe('string');
    });

    it('includes default selected topics', () => {
      useConnectionStore.getState().addRobot('Beta', 'ws://10.0.0.2');

      const robot = useConnectionStore.getState().robots['beta'];
      expect(robot?.selectedTopics).toBeDefined();
      expect(robot?.selectedTopics.camera).toBe('/camera/image_raw');
      expect(robot?.selectedTopics.lidar).toBe('/scan');
      expect(robot?.selectedTopics.imu).toBe('/imu/data');
    });

    it('does not overwrite existing robots when adding a new one', () => {
      useConnectionStore.getState().addRobot('Alpha', 'ws://10.0.0.1');
      useConnectionStore.getState().addRobot('Beta', 'ws://10.0.0.2');

      const robots = useConnectionStore.getState().robots;
      expect(Object.keys(robots)).toHaveLength(2);
      expect(robots['alpha']).toBeDefined();
      expect(robots['beta']).toBeDefined();
    });
  });

  describe('removeRobot', () => {
    it('deletes the robot entry', () => {
      useConnectionStore.getState().addRobot('Alpha', 'ws://10.0.0.1');
      expect(useConnectionStore.getState().robots['alpha']).toBeDefined();

      useConnectionStore.getState().removeRobot('alpha');
      expect(useConnectionStore.getState().robots['alpha']).toBeUndefined();
    });

    it('calls ConnectionManager.disconnect on removal', async () => {
      const { disconnect } = await import('@/lib/rosbridge/ConnectionManager');

      useConnectionStore.getState().addRobot('Alpha', 'ws://10.0.0.1');
      useConnectionStore.getState().removeRobot('alpha');

      expect(disconnect).toHaveBeenCalledWith('alpha');
    });

    it('does not affect other robots when removing one', () => {
      useConnectionStore.getState().addRobot('Alpha', 'ws://10.0.0.1');
      useConnectionStore.getState().addRobot('Beta', 'ws://10.0.0.2');

      useConnectionStore.getState().removeRobot('alpha');

      const robots = useConnectionStore.getState().robots;
      expect(robots['alpha']).toBeUndefined();
      expect(robots['beta']).toBeDefined();
    });
  });

  describe('setRobotTopic', () => {
    it('updates the selected topic for a specific panel', () => {
      useConnectionStore.getState().addRobot('Alpha', 'ws://10.0.0.1');

      useConnectionStore.getState().setRobotTopic('alpha', 'lidar', '/scan2');

      const robot = useConnectionStore.getState().robots['alpha'];
      expect(robot?.selectedTopics.lidar).toBe('/scan2');
    });

    it('does not mutate other selectedTopics fields', () => {
      useConnectionStore.getState().addRobot('Alpha', 'ws://10.0.0.1');

      const before = useConnectionStore.getState().robots['alpha']?.selectedTopics;

      useConnectionStore.getState().setRobotTopic('alpha', 'lidar', '/scan2');

      const after = useConnectionStore.getState().robots['alpha']?.selectedTopics;
      expect(after?.camera).toBe(before?.camera);
      expect(after?.imu).toBe(before?.imu);
      expect(after?.controls).toBe(before?.controls);
    });

    it('does not mutate other robot fields', () => {
      useConnectionStore.getState().addRobot('Alpha', 'ws://10.0.0.1');

      useConnectionStore.getState().setRobotTopic('alpha', 'camera', '/cam2');

      const robot = useConnectionStore.getState().robots['alpha'];
      expect(robot?.name).toBe('Alpha');
      expect(robot?.url).toBe('ws://10.0.0.1');
      expect(robot?.status).toBe('disconnected');
    });

    it('is a no-op for a non-existent robot', () => {
      useConnectionStore.getState().addRobot('Alpha', 'ws://10.0.0.1');

      useConnectionStore.getState().setRobotTopic('nonexistent', 'lidar', '/scan2');

      const robots = useConnectionStore.getState().robots;
      expect(Object.keys(robots)).toHaveLength(1);
      expect(robots['alpha']?.selectedTopics.lidar).toBe('/scan');
    });
  });
});
