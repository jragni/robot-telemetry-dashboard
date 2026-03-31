export type Direction = 'forward' | 'backward' | 'left' | 'right' | 'stop';

export interface VelocityLimits {
  readonly min: number;
  readonly max: number;
  readonly default: number;
}
