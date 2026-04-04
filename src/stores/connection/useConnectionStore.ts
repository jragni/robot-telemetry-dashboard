import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import * as ConnectionManager from '@/lib/rosbridge/ConnectionManager';
import { DEFAULT_PANEL_TOPICS } from '@/features/workspace/constants';

import { assignRobotColor, persistedStateSchema, toRobotId } from './useConnectionStore.helpers';
import type { ConnectionStore } from './useConnectionStore.types';

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set) => ({
      robots: {},

      addRobot: (name, url) => {
        const id = toRobotId(name);
        const existing = useConnectionStore.getState().robots[id];
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
              reconnectAttempt: null,
              color: assignRobotColor(name),
              selectedTopics: { ...DEFAULT_PANEL_TOPICS },
            },
          },
        }));
        return id;
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
        try {
          await ConnectionManager.connect(id, robot.url);
        } catch (error) {
          console.warn(`[ConnectionStore] connect rejected for ${id}:`, error);
        }
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
              id: robot.id,
              name: robot.name,
              url: robot.url,
              status: 'disconnected' as const,
              lastSeen: null,
              lastError: null,
              reconnectAttempt: null,
              color: robot.color,
              selectedTopics: robot.selectedTopics,
            },
          ]),
        ),
      }),
      merge: (persisted, current) => {
        const parsed = persistedStateSchema.safeParse(persisted);
        if (!parsed.success) return current;

        const migratedRobots = Object.fromEntries(
          Object.entries(parsed.data.robots).map(([key, robot]) => [
            key,
            {
              id: robot.id || key,
              name: robot.name || key,
              url: robot.url || '',
              status: 'disconnected' as const,
              lastSeen: null,
              lastError: null,
              reconnectAttempt: null,
              color: robot.color
                ? (robot.color as 'blue')
                : assignRobotColor(robot.name || key),
              selectedTopics: robot.selectedTopics ?? { ...DEFAULT_PANEL_TOPICS },
            },
          ]),
        );
        return { ...current, robots: migratedRobots };
      },
    },
  ),
);
