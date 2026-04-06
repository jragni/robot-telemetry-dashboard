import type { LidarPoint } from '@/types/lidar.types';

export interface UseLidarReturn {
  readonly points: readonly LidarPoint[];
  readonly rangeMax: number;
}
