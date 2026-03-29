import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConnectionStore } from './useConnectionStore.types';

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set) => ({
      robots: {},

      addRobot: (name, url) => {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        set((state) => ({
          robots: {
            ...state.robots,
            [id]: {
              id,
              name,
              url,
              status: 'offline',
              latencyMs: null,
              lastError: null,
            },
          },
        }));
      },

      removeRobot: (id) => {
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
            robots: {
              ...state.robots,
              [id]: { ...existing, ...patch },
            },
          };
        });
      },
    }),
    {
      name: 'rtd-connections',
      partialize: (state) => ({
        robots: Object.fromEntries(
          Object.entries(state.robots).map(([key, robot]) => [
            key,
            {
              id: robot.id,
              name: robot.name,
              url: robot.url,
              status: 'offline' as const,
              latencyMs: null,
              lastError: null,
            },
          ]),
        ),
      }),
    },
  ),
);
