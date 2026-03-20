import { create } from 'zustand';

import type { RobotConnectionState, RosStore } from './ros.types';

import type { ConnectionState } from '@/shared/types/connection.types';

const DEFAULT_STATE: RobotConnectionState = {
  state: 'disconnected',
  error: null,
};

export const useRosStore = create<RosStore>((set, get) => ({
  connectionStates: {},

  setConnectionState: (robotId: string, state: ConnectionState) => {
    set((prev) => ({
      connectionStates: {
        ...prev.connectionStates,
        [robotId]: {
          ...prev.connectionStates[robotId],
          state,
          error: prev.connectionStates[robotId]?.error ?? null,
        },
      },
    }));
  },

  setConnectionError: (robotId: string, error: string | null) => {
    set((prev) => ({
      connectionStates: {
        ...prev.connectionStates,
        [robotId]: {
          ...prev.connectionStates[robotId],
          state: prev.connectionStates[robotId]?.state ?? 'disconnected',
          error,
        },
      },
    }));
  },

  getConnectionState: (robotId: string): RobotConnectionState => {
    return get().connectionStates[robotId] ?? DEFAULT_STATE;
  },

  removeRobot: (robotId: string) => {
    set((prev) => {
      const { [robotId]: _, ...rest } = prev.connectionStates;
      return { connectionStates: rest };
    });
  },
}));
