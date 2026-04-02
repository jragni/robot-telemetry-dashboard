import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_PANEL_TOPICS } from '@/features/workspace/constants';
import * as ConnectionManager from '@/lib/rosbridge/ConnectionManager';

import { assignRobotColor } from './useConnectionStore.helpers';
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
              color: assignRobotColor(name),
              id,
              lastError: null,
              lastSeen: null,
              name,
              selectedTopics: { ...DEFAULT_PANEL_TOPICS },
              status: 'disconnected',
              url,
            },
          },
        }));
      },

      removeRobot: (id) => {
        ConnectionManager.disconnect(id);
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

      connectRobot: async (id) => {
        const robot = useConnectionStore.getState().robots[id];
        if (!robot) return;
        await ConnectionManager.connect(id, robot.url);
      },

      disconnectRobot: (id) => {
        ConnectionManager.disconnect(id);
      },

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
    }),
    {
      name: 'rtd-connections',
      partialize: (state) => ({
        robots: Object.fromEntries(
          Object.entries(state.robots).map(([key, robot]) => [
            key,
            {
              color: robot.color,
              id: robot.id,
              lastError: null,
              lastSeen: null,
              name: robot.name,
              selectedTopics: robot.selectedTopics,
              status: 'disconnected' as const,
              url: robot.url,
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
              color: (robot.color as string | undefined)
                ? (robot.color as 'blue')
                : assignRobotColor((robot.name as string) || key),
              id: (robot.id as string) || key,
              lastError: null,
              lastSeen: null,
              name: (robot.name as string) || key,
              selectedTopics: (robot.selectedTopics as Partial<Record<string, string>> | undefined) ?? { ...DEFAULT_PANEL_TOPICS },
              status: 'disconnected' as const,
              url: (robot.url as string) || '',
            },
          ]),
        );
        return { ...current, robots: migratedRobots };
      },
    },
  ),
);
