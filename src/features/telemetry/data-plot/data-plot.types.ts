export type PlotStrategyId =
  | 'imu-acceleration'
  | 'imu-angular-velocity'
  | 'odometry-linear'
  | 'battery-voltage'
  | 'numeric-flat';

export interface NumericPath {
  label: string;
  path: string[];
  unit?: string;
}

export interface PlotStrategy {
  id: PlotStrategyId;
  label: string;
  paths: NumericPath[];
}

export interface PlotSample {
  timestamp: number;
  values: Record<string, number>;
}
