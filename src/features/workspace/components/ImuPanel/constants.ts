import type { ComponentType } from 'react';
import type { ImuVariant, ImuOrientation } from '@/features/workspace/types/ImuPanel.types';
import { AttitudeCompassView } from './components/AttitudeCompassView';
import { NumbersView } from './components/NumbersView';
import { AttitudeView } from './components/AttitudeView';
import { WireframeView } from './components/WireframeView';

/** CUBE_VERTICES
 * @description Vertex positions for the 3D wireframe cube.
 */
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

/** CUBE_EDGES
 * @description Edge connections (vertex index pairs) for the 3D wireframe cube.
 */
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

/** ATTITUDE_CANVAS_TOKEN_MAP
 * @description Maps local color keys to CSS custom property names for the
 *  attitude indicator canvas. Used with the useCanvasColors hook.
 */
export const ATTITUDE_CANVAS_TOKEN_MAP = {
  accent: '--color-accent',
  border: '--color-border',
  ground: '--color-imu-ground',
  sky: '--color-imu-sky',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
} as const;

/** COMPASS_CANVAS_TOKEN_MAP
 * @description Maps local color keys to CSS custom property names for the
 *  compass heading canvas. Used with the useCanvasColors hook.
 */
export const COMPASS_CANVAS_TOKEN_MAP = {
  accent: '--color-accent',
  border: '--color-border',
  muted: '--color-text-muted',
  primary: '--color-text-primary',
} as const;

/** WIREFRAME_CANVAS_TOKEN_MAP
 * @description Maps local color keys to CSS custom property names for the
 *  wireframe view canvas. Used with the useCanvasColors hook.
 */
export const WIREFRAME_CANVAS_TOKEN_MAP = {
  accent: '--color-accent',
  border: '--color-border',
  muted: '--color-text-muted',
} as const;

/** VARIANT_VIEWS
 * @description Maps each IMU visualization variant to its view component.
 */
export const VARIANT_VIEWS: Record<ImuVariant, ComponentType<ImuOrientation>> = {
  'attitude-compass': AttitudeCompassView,
  numbers: NumbersView,
  attitude: AttitudeView,
  '3d': WireframeView,
};
