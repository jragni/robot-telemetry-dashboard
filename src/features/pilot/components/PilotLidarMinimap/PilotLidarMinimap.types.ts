import type { LidarPoint } from '../../types/PilotView.types';

export interface PilotLidarMinimapProps {
  readonly heading: number;
  readonly maxSize?: number;
  readonly points: readonly LidarPoint[];
  readonly rangeMax: number;
}
