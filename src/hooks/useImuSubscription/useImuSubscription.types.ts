import type { Vector3 } from '@/types/ros2-primitives.types';

export interface UseImuReturn {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
  readonly angularVelocity: Vector3 | undefined;
  readonly linearAcceleration: Vector3 | undefined;
}
