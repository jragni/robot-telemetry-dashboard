import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { ConnectionsActions, ConnectionsState } from './connections.types';

import type { RobotConnection } from '@/types';

// ---------------------------------------------------------------------------
// Full store type
// ---------------------------------------------------------------------------

type ConnectionsStore = ConnectionsState & ConnectionsActions;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: ConnectionsState = {
  robots: [],
  activeRobotId: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useConnectionsStore = create<ConnectionsStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        addRobot(robot) {
          const id = crypto.randomUUID();
          const newRobot: RobotConnection = {
            ...robot,
            id,
            createdAt: Date.now(),
          };

          set(
            (state) => {
              const isFirst = state.robots.length === 0;
              return {
                robots: [...state.robots, newRobot],
                activeRobotId: isFirst ? id : state.activeRobotId,
              };
            },
            false,
            'connections/addRobot'
          );

          return id;
        },

        removeRobot(id) {
          set(
            (state) => ({
              robots: state.robots.filter((r) => r.id !== id),
              activeRobotId:
                state.activeRobotId === id ? null : state.activeRobotId,
            }),
            false,
            'connections/removeRobot'
          );
        },

        setActiveRobot(id) {
          set({ activeRobotId: id }, false, 'connections/setActiveRobot');
        },

        getActiveRobot() {
          const { robots, activeRobotId } = get();
          if (activeRobotId === null) return undefined;
          return robots.find((r) => r.id === activeRobotId);
        },
      }),
      { name: 'rtd-connections' }
    ),
    { name: 'ConnectionsStore' }
  )
);
