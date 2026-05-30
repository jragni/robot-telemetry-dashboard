import type { Vector3 } from '@/types/ros2-primitives.types';

export interface UseImuReturn {
  readonly roll: number | null;
  readonly pitch: number | null;
  readonly yaw: number | null;
  readonly angularVelocity: Vector3 | undefined;
  readonly linearAcceleration: Vector3 | undefined;
}
