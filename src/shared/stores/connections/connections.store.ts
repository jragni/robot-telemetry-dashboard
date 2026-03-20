import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { ConnectionsStore } from './connections.types';

import type { RobotConnection } from '@/shared/types/connection.types';

const getStorage = () => {
  try {
    // Test that localStorage is functional
    const testKey = '__zustand_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return createJSONStorage(() => localStorage);
  } catch {
    // Fallback for environments where localStorage is not available (e.g. jsdom)
    return undefined;
  }
};

export const useConnectionsStore = create<ConnectionsStore>()(
  persist(
    (set) => ({
      robots: [],
      activeRobotId: null,

      addRobot: (robot: RobotConnection) => {
        set((state) => {
          const exists = state.robots.some((r) => r.id === robot.id);
          if (exists) return state;
          return { robots: [...state.robots, robot] };
        });
      },

      removeRobot: (robotId: string) => {
        set((state) => ({
          robots: state.robots.filter((r) => r.id !== robotId),
          activeRobotId:
            state.activeRobotId === robotId ? null : state.activeRobotId,
        }));
      },

      setActiveRobot: (robotId: string | null) => {
        set({ activeRobotId: robotId });
      },
    }),
    {
      name: 'robot-connections',
      storage: getStorage(),
    }
  )
);
