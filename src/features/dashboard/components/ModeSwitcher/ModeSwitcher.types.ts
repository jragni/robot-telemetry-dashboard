import type { DashboardMode } from '../../types/panel-system.types';

export interface ModeSwitcherProps {
  isMobile?: boolean;
}

export interface ModeButtonConfig {
  mode: DashboardMode;
  label: string;
}
