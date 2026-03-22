import type React from 'react';
import type { LayoutItem } from 'react-grid-layout';
import { create } from 'zustand';

import { DEFAULT_ROBOT_LAYOUT } from '@/features/dashboard/registry/defaultLayouts';

const LS_PREFIX = 'rdt-layout-robot-';

// Only accept known widget IDs to guard against localStorage corruption
const VALID_PANEL_IDS = new Set([
  'map',
  'video',
  'video-pip-1',
  'video-pip-2',
  'fleet-status',
  'alerts',
  'robot-controls',
  'imu',
  'data-plot',
  'topic-list',
  'lidar',
  'depth-camera',
  'tab-group-1',
  'tab-group-2',
]);

function isValidLayout(data: unknown): data is readonly LayoutItem[] {
  if (!Array.isArray(data)) return false;
  for (const item of data) {
    if (typeof item !== 'object' || item === null) return false;
    if (typeof (item as Record<string, unknown>).i !== 'string') return false;
    const id = (item as { i: string }).i;
    // Accept both base IDs and composite IDs like 'video-pip-1-<timestamp>'
    const base = VALID_PANEL_IDS.has(id)
      ? id
      : [...VALID_PANEL_IDS].find((v) => id.startsWith(`${v}-`));
    if (!base) return false;
  }
  return true;
}

function loadFromStorage(robotId: string): readonly LayoutItem[] {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${robotId}`);
    if (!raw) return DEFAULT_ROBOT_LAYOUT;
    const parsed: unknown = JSON.parse(raw);
    if (isValidLayout(parsed)) return parsed;
    return DEFAULT_ROBOT_LAYOUT;
  } catch {
    return DEFAULT_ROBOT_LAYOUT;
  }
}

interface RobotLayoutState {
  layouts: Record<string, readonly LayoutItem[]>;
  skipNextSaveRef: React.MutableRefObject<boolean>;
  getLayout: (robotId: string) => readonly LayoutItem[];
  saveLayout: (robotId: string, layout: readonly LayoutItem[]) => void;
  resetLayout: (robotId: string) => void;
}

const skipNextSaveRef: React.MutableRefObject<boolean> = { current: false };

export const useRobotLayoutStore = create<RobotLayoutState>()((set, get) => ({
  layouts: {},
  skipNextSaveRef,

  getLayout: (robotId: string): readonly LayoutItem[] => {
    const cached = get().layouts[robotId];
    if (cached) return cached;
    const loaded = loadFromStorage(robotId);
    set((state) => ({ layouts: { ...state.layouts, [robotId]: loaded } }));
    return loaded;
  },

  saveLayout: (robotId: string, layout: readonly LayoutItem[]) => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    try {
      localStorage.setItem(`${LS_PREFIX}${robotId}`, JSON.stringify(layout));
    } catch {
      // localStorage not available
    }
    set((state) => ({ layouts: { ...state.layouts, [robotId]: layout } }));
  },

  resetLayout: (robotId: string) => {
    skipNextSaveRef.current = true;
    try {
      localStorage.setItem(
        `${LS_PREFIX}${robotId}`,
        JSON.stringify(DEFAULT_ROBOT_LAYOUT)
      );
    } catch {
      // localStorage not available
    }
    set((state) => ({
      layouts: { ...state.layouts, [robotId]: DEFAULT_ROBOT_LAYOUT },
    }));
  },
}));
