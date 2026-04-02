import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';
import type { ConnectionStore } from '../useConnectionStore.types';
import { assignRobotColor, toRobotId } from '../useConnectionStore.helpers';

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
    setRobotTopic: vi.fn(),
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
