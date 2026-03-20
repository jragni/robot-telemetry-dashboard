import type React from 'react';
import type { LayoutItem } from 'react-grid-layout';

import type { DashboardMode, ModeLayouts } from '../types/panel-system.types';

export interface LayoutState {
  layouts: ModeLayouts;
  skipNextSaveRef: React.MutableRefObject<boolean>;
  saveLayout: (mode: DashboardMode, layout: readonly LayoutItem[]) => void;
  resetLayout: (mode: DashboardMode) => void;
  getLayout: (mode: DashboardMode) => readonly LayoutItem[];
  hydrateFromStorage: () => void;
}
