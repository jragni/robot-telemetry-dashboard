import type { LayoutItem } from 'react-grid-layout';

import type { ModeLayouts } from '../types/panel-system.types';

const DASHBOARD_DEFAULT: readonly LayoutItem[] = [
  { i: 'map', x: 3, y: 0, w: 6, h: 8 },
  { i: 'video-pip-1', x: 0, y: 0, w: 3, h: 4 },
  { i: 'fleet-status', x: 0, y: 4, w: 3, h: 4 },
  { i: 'video-pip-2', x: 9, y: 0, w: 3, h: 4 },
  { i: 'alerts', x: 9, y: 4, w: 3, h: 4 },
];

const PILOT_DEFAULT: readonly LayoutItem[] = [
  { i: 'video', x: 0, y: 0, w: 12, h: 8 },
  { i: 'controls', x: 0, y: 8, w: 12, h: 3 },
  { i: 'imu', x: 0, y: 11, w: 3, h: 3 },
  { i: 'data-plot', x: 3, y: 11, w: 6, h: 3 },
  { i: 'topic-list', x: 9, y: 11, w: 3, h: 3 },
];

const ENGINEER_DEFAULT: readonly LayoutItem[] = [
  { i: 'video', x: 0, y: 0, w: 4, h: 6 },
  { i: 'lidar', x: 4, y: 0, w: 4, h: 6 },
  { i: 'tab-group-1', x: 8, y: 0, w: 4, h: 6 },
  { i: 'topic-list', x: 0, y: 6, w: 4, h: 4 },
  { i: 'data-plot', x: 4, y: 6, w: 8, h: 4 },
];

export const DEFAULT_LAYOUTS: ModeLayouts = {
  dashboard: DASHBOARD_DEFAULT,
  pilot: PILOT_DEFAULT,
  engineer: ENGINEER_DEFAULT,
};
