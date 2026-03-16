import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Per-robot control entry
// ---------------------------------------------------------------------------

interface RobotControlEntry {
  linearVelocity: number;
  angularVelocity: number;
  selectedTopic: string;
  isEStopActive: boolean;
}

// ---------------------------------------------------------------------------
// Exported defaults (consumed by store and tests)
// ---------------------------------------------------------------------------

export const DEFAULT_CONTROL_STATE: RobotControlEntry = {
  linearVelocity: 0.5,
  angularVelocity: 0.5,
  selectedTopic: '/cmd_vel',
  isEStopActive: false,
};

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface ControlState {
  robotControls: Record<string, RobotControlEntry>;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface ControlActions {
  setLinearVelocity(robotId: string, velocity: number): void;
  setAngularVelocity(robotId: string, velocity: number): void;
  setSelectedTopic(robotId: string, topic: string): void;
  activateEStop(robotId: string): void;
  deactivateEStop(robotId: string): void;
  getControlState(robotId: string): RobotControlEntry;
}

// ---------------------------------------------------------------------------
// Full store type
// ---------------------------------------------------------------------------

type ControlStore = ControlState & ControlActions;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the stored entry for robotId, or a copy of the defaults. */
const getEntry = (
  controls: Record<string, RobotControlEntry>,
  robotId: string
): RobotControlEntry => controls[robotId] ?? { ...DEFAULT_CONTROL_STATE };

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useControlStore = create<ControlStore>()(
  devtools(
    persist(
      (set, get) => ({
        robotControls: {},

        setLinearVelocity(robotId, velocity) {
          set(
            (prev) => ({
              robotControls: {
                ...prev.robotControls,
                [robotId]: {
                  ...getEntry(prev.robotControls, robotId),
                  linearVelocity: velocity,
                },
              },
            }),
            false,
            'control/setLinearVelocity'
          );
        },

        setAngularVelocity(robotId, velocity) {
          set(
            (prev) => ({
              robotControls: {
                ...prev.robotControls,
                [robotId]: {
                  ...getEntry(prev.robotControls, robotId),
                  angularVelocity: velocity,
                },
              },
            }),
            false,
            'control/setAngularVelocity'
          );
        },

        setSelectedTopic(robotId, topic) {
          set(
            (prev) => ({
              robotControls: {
                ...prev.robotControls,
                [robotId]: {
                  ...getEntry(prev.robotControls, robotId),
                  selectedTopic: topic,
                },
              },
            }),
            false,
            'control/setSelectedTopic'
          );
        },

        activateEStop(robotId) {
          set(
            (prev) => ({
              robotControls: {
                ...prev.robotControls,
                [robotId]: {
                  ...getEntry(prev.robotControls, robotId),
                  isEStopActive: true,
                },
              },
            }),
            false,
            'control/activateEStop'
          );
        },

        deactivateEStop(robotId) {
          set(
            (prev) => ({
              robotControls: {
                ...prev.robotControls,
                [robotId]: {
                  ...getEntry(prev.robotControls, robotId),
                  isEStopActive: false,
                },
              },
            }),
            false,
            'control/deactivateEStop'
          );
        },

        getControlState(robotId) {
          return getEntry(get().robotControls, robotId);
        },
      }),
      { name: 'rtd-control' }
    ),
    { name: 'ControlStore' }
  )
);
