import { create } from 'zustand';

import type { DashboardMode } from '../types/panel-system.types';

import type { ModeState } from './modeStore.types';

const SESSION_KEY = 'rdt-current-mode';
const VALID_MODES = ['dashboard', 'pilot', 'engineer'] as const;

function readSessionMode(): DashboardMode {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if ((VALID_MODES as readonly string[]).includes(stored ?? '')) {
      return stored as DashboardMode;
    }
  } catch {
    // sessionStorage not available
  }
  return 'dashboard';
}

export const useModeStore = create<ModeState>()((set) => ({
  currentMode: readSessionMode(),

  switchMode: (mode: DashboardMode) => {
    try {
      sessionStorage.setItem(SESSION_KEY, mode);
    } catch {
      // sessionStorage not available
    }
    set({ currentMode: mode });
  },
}));
