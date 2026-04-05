import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConnectionStore } from './useConnectionStore.types';
import { assignRobotColor, toRobotId, persistedStateSchema } from './useConnectionStore.helpers';
import * as ConnectionManager from '@/lib/rosbridge/ConnectionManager';
import { DEFAULT_PANEL_TOPICS } from '@/constants/panelTopics';

import { assignRobotColor, isValidRobotColor, persistedStateSchema, toRobotId } from './useConnectionStore.helpers';
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
              color: assignRobotColor(name),
              id,
              lastError: null,
              lastSeen: null,
              name,
              reconnectAttempt: null,
              selectedTopics: { ...DEFAULT_PANEL_TOPICS },
              status: 'disconnected',
              url,
            },
          },
        }));
        return id;
      },

      removeRobot: (id) => {
        connectionManager.disconnect(id);
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
          await connectionManager.connect(id, robot.url);
        } catch (error) {
          console.warn(`[ConnectionStore] connect rejected for ${id}:`, error);
        }
      },

      disconnectRobot: (id) => {
        connectionManager.disconnect(id);
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
              reconnectAttempt: null,
              selectedTopics: robot.selectedTopics,
              status: 'disconnected' as const,
              url: robot.url,
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
              color: robot.color && isValidRobotColor(robot.color)
                ? robot.color
                : assignRobotColor(robot.name || key),
              id: robot.id || key,
              lastError: null,
              lastSeen: null,
              name: robot.name || key,
              reconnectAttempt: null,
              selectedTopics: robot.selectedTopics ?? { ...DEFAULT_PANEL_TOPICS },
              status: 'disconnected' as const,
              url: robot.url || '',
            },
          ]),
        );
        return { ...current, robots: migratedRobots };
      },
    },
  ),
);
