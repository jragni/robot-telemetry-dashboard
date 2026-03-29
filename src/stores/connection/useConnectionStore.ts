import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConnectionStore } from './useConnectionStore.types';
import { assignRobotColor } from './useConnectionStore.helpers';

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
              status: 'disconnected',
              lastSeen: null,
              lastError: null,
              color: assignRobotColor(name),
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
              status: 'disconnected' as const,
              lastSeen: null,
              lastError: null,
              color: robot.color,
            },
          ]),
        ),
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Record<string, unknown> | undefined;
        if (!persistedState?.robots) return current;
        const robots = persistedState.robots as Record<
          string,
          Record<string, unknown>
        >;
        const migratedRobots = Object.fromEntries(
          Object.entries(robots).map(([key, robot]) => [
            key,
            {
              id: (robot.id as string) || key,
              name: (robot.name as string) || key,
              url: (robot.url as string) || '',
              status:
                robot.status === 'connected'
                  ? ('connected' as const)
                  : ('disconnected' as const),
              lastSeen: null,
              lastError: null,
              color: (robot.color as string | undefined)
                ? (robot.color as 'blue')
                : assignRobotColor((robot.name as string) || key),
            },
          ]),
        );
        return { ...current, robots: migratedRobots };
      },
    },
  ),
);
