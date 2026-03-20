import { createStore } from 'zustand/vanilla';

import type { ControlState } from '../types/robot-control.types';

export function createControlStore(_robotId: string) {
  return createStore<ControlState>((set) => ({
    selectedTopic: '/cmd_vel',
    linearVelocity: 0.5,
    angularVelocity: 0.5,
    eStopActive: false,
    activeDirection: null,

    activateEStop: () => set({ eStopActive: true, activeDirection: null }),

    releaseEStop: () => set({ eStopActive: false }),

    setTopic: (topic) => set({ selectedTopic: topic }),

    setLinearVelocity: (v) => set({ linearVelocity: Math.max(0.1, v) }),

    setAngularVelocity: (v) => set({ angularVelocity: Math.max(0.1, v) }),

    setDirection: (d) =>
      set((state) => {
        if (state.eStopActive) return {};
        return { activeDirection: d };
      }),
  }));
}
