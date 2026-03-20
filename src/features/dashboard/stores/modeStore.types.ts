import type { DashboardMode } from '../types/panel-system.types';

export interface ModeState {
  currentMode: DashboardMode;
  switchMode: (mode: DashboardMode) => void;
}
