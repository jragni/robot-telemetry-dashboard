import type { Vector3 } from '@/types/ros2-primitives.types';

export interface Orientation {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
}

export interface UseImuReturn {
  readonly orientation: Orientation | null;
  readonly angularVelocity: Vector3 | undefined;
  readonly linearAcceleration: Vector3 | undefined;
}
