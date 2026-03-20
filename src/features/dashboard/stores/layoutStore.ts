import type React from 'react';
import type { LayoutItem } from 'react-grid-layout';
import { create } from 'zustand';

import { DEFAULT_LAYOUTS } from '../registry/defaultLayouts';
import type { DashboardMode } from '../types/panel-system.types';

import type { LayoutState } from './layoutStore.types';

// All known panel IDs — composite keys like 'video-pip-1' are valid
const VALID_PANEL_IDS = new Set([
  'map',
  'video',
  'video-pip-1',
  'video-pip-2',
  'fleet-status',
  'alerts',
  'controls',
  'imu',
  'data-plot',
  'topic-list',
  'lidar',
  'depth-camera',
  'tab-group-1',
  'tab-group-2',
]);

const LS_KEYS: Record<DashboardMode, string> = {
  dashboard: 'rdt-layout-dashboard',
  pilot: 'rdt-layout-pilot',
  engineer: 'rdt-layout-engineer',
};

function isLayoutItem(item: unknown): item is { i: string } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'i' in item &&
    typeof (item as Record<string, unknown>).i === 'string'
  );
}

function isValidLayout(data: unknown): data is readonly LayoutItem[] {
  if (!Array.isArray(data)) return false;
  for (const item of data) {
    if (!isLayoutItem(item)) return false;
    if (!VALID_PANEL_IDS.has(item.i)) return false;
  }
  return true;
}

function loadFromStorage(mode: DashboardMode): readonly LayoutItem[] {
  try {
    const raw = localStorage.getItem(LS_KEYS[mode]);
    if (!raw) return DEFAULT_LAYOUTS[mode];
    const parsed: unknown = JSON.parse(raw);
    if (isValidLayout(parsed)) return parsed;
    console.warn(
      `[LayoutStore] Layout corrupted or outdated — restoring defaults for ${mode}`
    );
    return DEFAULT_LAYOUTS[mode];
  } catch {
    console.warn(
      `[LayoutStore] Layout corrupted or outdated — restoring defaults for ${mode}`
    );
    return DEFAULT_LAYOUTS[mode];
  }
}

const skipNextSaveRef: React.MutableRefObject<boolean> = { current: false };

export const useLayoutStore = create<LayoutState>()((set, get) => ({
  layouts: {
    dashboard: DEFAULT_LAYOUTS.dashboard,
    pilot: DEFAULT_LAYOUTS.pilot,
    engineer: DEFAULT_LAYOUTS.engineer,
  },

  skipNextSaveRef,

  getLayout: (mode: DashboardMode): readonly LayoutItem[] => {
    return get().layouts[mode];
  },

  saveLayout: (mode: DashboardMode, layout: readonly LayoutItem[]) => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    try {
      localStorage.setItem(LS_KEYS[mode], JSON.stringify(layout));
    } catch {
      // localStorage not available
    }
    set((state) => ({
      layouts: { ...state.layouts, [mode]: layout },
    }));
  },

  resetLayout: (mode: DashboardMode) => {
    skipNextSaveRef.current = true;
    const defaultLayout = DEFAULT_LAYOUTS[mode];
    try {
      localStorage.setItem(LS_KEYS[mode], JSON.stringify(defaultLayout));
    } catch {
      // localStorage not available
    }
    set((state) => ({
      layouts: { ...state.layouts, [mode]: defaultLayout },
    }));
  },

  hydrateFromStorage: () => {
    const modes: DashboardMode[] = ['dashboard', 'pilot', 'engineer'];
    const newLayouts = { ...get().layouts };
    for (const mode of modes) {
      newLayouts[mode] = loadFromStorage(mode);
    }
    set({ layouts: newLayouts });
  },
}));
