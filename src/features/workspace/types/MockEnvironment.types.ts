import type { Vector3 } from '@/types/ros2-primitives.types';

export interface Wall {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface Obstacle {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
}

export interface MockEnvironmentState {
  readonly position: Vector3;
  readonly heading: number;
  readonly linearVelocity: number;
  readonly angularVelocity: number;
  readonly timestamp: number;
  readonly walls: readonly Wall[];
  readonly obstacles: readonly Obstacle[];
}
