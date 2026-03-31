export interface LidarPoint {
  readonly angle: number;
  readonly distance: number;
  readonly intensity?: number;
}

export interface LidarPanelProps {
  readonly points: readonly LidarPoint[];
  readonly rangeMax: number;
  readonly connected: boolean;
}
