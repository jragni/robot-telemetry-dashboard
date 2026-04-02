import type { ComponentType } from 'react';
import type { ImuVariant, ImuOrientation } from '@/features/workspace/types/ImuPanel.types';
import { AttitudeCompassView } from './components/AttitudeCompassView';
import { NumbersView } from './components/NumbersView';
import { AttitudeView } from './components/AttitudeView';
import { WireframeView } from './components/WireframeView';

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
