import type { Vector3 } from '@/types/ros2-primitives.types';

export type ImuVariant = 'attitude-compass' | 'numbers' | 'attitude' | '3d';

export interface AttitudeIndicatorProps {
  readonly roll: number;
  readonly pitch: number;
}

export interface CompassHeadingProps {
  readonly yaw: number;
}

export interface NumbersViewProps {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
}

export interface AttitudeViewProps {
  readonly roll: number;
  readonly pitch: number;
}

export interface WireframeViewProps {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
}

export interface ImuPanelProps {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
  readonly connected: boolean;
  readonly variant: ImuVariant;
  readonly angularVelocity?: Vector3;
  readonly linearAcceleration?: Vector3;
}
