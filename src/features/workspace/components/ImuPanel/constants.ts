import type { ComponentType } from 'react';

import type { ImuVariant, ImuOrientation } from '@/features/workspace/types/ImuPanel.types';

import { AttitudeCompassView } from './components/AttitudeCompassView';
import { NumbersView } from './components/NumbersView';
import { AttitudeView } from './components/AttitudeView';
import { WireframeView } from './components/WireframeView';

export const WIREFRAME_CANVAS_SIZE = 160;
export const WIREFRAME_SCALE_FACTOR = 0.22;
export const WIREFRAME_FOCAL_LENGTH = 4;
export const WIREFRAME_CENTER_DOT_RADIUS = 2;

export const ATTITUDE_CANVAS_SIZE = 120;
export const ATTITUDE_PITCH_SCALE = 0.6;
export const ATTITUDE_TICK_HALF_WIDTH_MAJOR = 10;
export const ATTITUDE_TICK_HALF_WIDTH_MINOR = 6;
export const ATTITUDE_CROSSHAIR_OUTER = 8;
export const ATTITUDE_CROSSHAIR_INNER = 3;

export const COMPASS_HEADING_CANVAS_SIZE = 120;
export const COMPASS_HEADING_TICK_LEN_CARDINAL = 10;
export const COMPASS_HEADING_TICK_LEN_30 = 6;
export const COMPASS_HEADING_TICK_LEN_MINOR = 3;
export const COMPASS_HEADING_LABEL_OFFSET = 18;

export const CANVAS_BORDER_INSET = 4;
export const CANVAS_POINTER_HALF_WIDTH = 4;
export const CANVAS_POINTER_TOP_Y = 6;

export const CUBE_VERTICES: readonly [number, number, number][] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

export const CUBE_EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

export const VARIANT_VIEWS: Record<ImuVariant, ComponentType<ImuOrientation>> = {
  'attitude-compass': AttitudeCompassView,
  numbers: NumbersView,
  attitude: AttitudeView,
  '3d': WireframeView,
};
