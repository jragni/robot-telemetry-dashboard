import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';
import type { ConnectionStore } from '../useConnectionStore.types';
import { assignRobotColor, toRobotId } from '../useConnectionStore.helpers';
import type { PanelId } from '@/types/panel.types';

vi.mock('roslib', () => ({
  Ros: vi.fn(),
  Topic: vi.fn(),
}));

const mockDisconnect = vi.fn();

const DEFAULT_PANEL_TOPICS: Record<string, string> = {
  camera: '/camera/image_raw',
  lidar: '/scan',
  imu: '/imu/data',
  controls: '/cmd_vel',
  telemetry: '/odom',
};

/**
 * Creates a test store identical to the production store but without persist
 * middleware, avoiding localStorage issues in the test environment.
 */
function createTestStore() {
  const store = create<ConnectionStore>()((set) => ({
    robots: {},

    addRobot: (name, url) => {
      const id = toRobotId(name);
      const existing = store.getState().robots[id];
      if (existing) return null;

      set((state) => ({
        robots: {
          ...state.robots,
          [id]: {
            id,
            name,
            url,
            status: 'disconnected',
            lastSeen: null,
            lastError: null,
            color: assignRobotColor(name),
            selectedTopics: { ...DEFAULT_PANEL_TOPICS },
          },
        },
      }));
      return id;
    },

    removeRobot: (id) => {
      mockDisconnect(id);
      set((state) => {
        const { [id]: _removed, ...rest } = state.robots;
        void _removed;
        return { robots: rest };
      });
    },

    updateRobot: (id, patch) => {
      set((state) => {
        const existing = state.robots[id];
        if (!existing) return state;
        return {
          robots: { ...state.robots, [id]: { ...existing, ...patch } },
        };
      });
    },

    connectRobot: vi.fn(),
    disconnectRobot: vi.fn(),

    setRobotTopic: (id, panelId, topicName) => {
      set((state) => {
        const existing = state.robots[id];
        if (!existing) return state;
        return {
          robots: {
            ...state.robots,
            [id]: {
              ...existing,
              selectedTopics: { ...existing.selectedTopics, [panelId]: topicName },
            },
          },
        };
      });
    },
  }));

  return store;
}

describe('useConnectionStore.addRobot', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('adds a robot and returns its ID', () => {
    const id = store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    expect(id).toBe('atlas-01');
    expect(store.getState().robots['atlas-01']).toBeDefined();
    expect(store.getState().robots['atlas-01']?.name).toBe('Atlas 01');
  });

  it('returns null when adding a duplicate robot', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    const second = store.getState().addRobot('Atlas 01', 'ws://other:9090');
    expect(second).toBeNull();
  });

  it('does not overwrite existing robot on duplicate add', () => {
    store.getState().addRobot('Atlas 01', 'ws://first:9090');
    store.getState().addRobot('Atlas 01', 'ws://second:9090');
    expect(store.getState().robots['atlas-01']?.url).toBe('ws://first:9090');
  });

  it('treats whitespace variants as the same ID', () => {
    const id1 = store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    const id2 = store.getState().addRobot('Atlas  01', 'ws://other:9090');
    expect(id1).toBe('atlas-01');
    expect(id2).toBeNull();
  });

  it('generates URL-safe IDs from names with special characters', () => {
    const id = store.getState().addRobot('atlas/01!', 'ws://localhost:9090');
    expect(id).toBe('atlas01');
  });
});

describe('useConnectionStore.removeRobot', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('removes an existing robot from the store', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    expect(store.getState().robots['atlas-01']).toBeDefined();

    store.getState().removeRobot('atlas-01');
    expect(store.getState().robots['atlas-01']).toBeUndefined();
  });

  it('calls disconnect when removing a robot', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    store.getState().removeRobot('atlas-01');
    expect(mockDisconnect).toHaveBeenCalledWith('atlas-01');
  });

  it('handles removal of non-existent ID gracefully', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    store.getState().removeRobot('does-not-exist');
    expect(store.getState().robots['atlas-01']).toBeDefined();
  });

  it('does not affect other robots when removing one', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    store.getState().addRobot('Spot 02', 'ws://localhost:9091');
    store.getState().removeRobot('atlas-01');

    expect(store.getState().robots['atlas-01']).toBeUndefined();
    expect(store.getState().robots['spot-02']).toBeDefined();
  });
});

describe('useConnectionStore.updateRobot', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('patches an existing robot field', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    store.getState().updateRobot('atlas-01', { status: 'connected' });
    expect(store.getState().robots['atlas-01']?.status).toBe('connected');
  });

  it('preserves unpatched fields', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    store.getState().updateRobot('atlas-01', { lastError: 'timeout' });

    const robot = store.getState().robots['atlas-01'];
    expect(robot?.name).toBe('Atlas 01');
    expect(robot?.url).toBe('ws://localhost:9090');
    expect(robot?.lastError).toBe('timeout');
  });

  it('no-ops on a missing robot ID', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    const before = store.getState().robots;
    store.getState().updateRobot('does-not-exist', { status: 'error' });
    expect(store.getState().robots).toEqual(before);
  });

  it('applies multiple fields in a single patch', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    store.getState().updateRobot('atlas-01', {
      lastError: 'connection refused',
      lastSeen: 1700000000,
      status: 'error',
    });

    const robot = store.getState().robots['atlas-01'];
    expect(robot?.status).toBe('error');
    expect(robot?.lastError).toBe('connection refused');
    expect(robot?.lastSeen).toBe(1700000000);
  });
});

describe('useConnectionStore.setRobotTopic', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('sets a topic for a specific panel', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    const panelId: PanelId = 'camera';
    store.getState().setRobotTopic('atlas-01', panelId, '/camera/compressed');

    const robot = store.getState().robots['atlas-01'];
    expect(robot?.selectedTopics.camera).toBe('/camera/compressed');
  });

  it('preserves other panel topics when setting one', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    const originalTopics = { ...store.getState().robots['atlas-01']?.selectedTopics };

    store.getState().setRobotTopic('atlas-01', 'lidar', '/scan2');

    const robot = store.getState().robots['atlas-01'];
    expect(robot?.selectedTopics.lidar).toBe('/scan2');
    expect(robot?.selectedTopics.camera).toBe(originalTopics.camera);
    expect(robot?.selectedTopics.imu).toBe(originalTopics.imu);
  });

  it('no-ops on a missing robot ID', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    const before = store.getState().robots;
    store.getState().setRobotTopic('does-not-exist', 'camera', '/topic');
    expect(store.getState().robots).toEqual(before);
  });

  it('overwrites a previously set topic', () => {
    store.getState().addRobot('Atlas 01', 'ws://localhost:9090');
    store.getState().setRobotTopic('atlas-01', 'camera', '/cam1');
    store.getState().setRobotTopic('atlas-01', 'camera', '/cam2');
    expect(store.getState().robots['atlas-01']?.selectedTopics.camera).toBe('/cam2');
  });
});
