import type { LidarPoint } from '@/types/lidar.types';

export type { LidarPoint };

export interface LidarPanelProps {
  readonly points: readonly LidarPoint[];
  readonly rangeMax: number;
  readonly connected: boolean;
}
