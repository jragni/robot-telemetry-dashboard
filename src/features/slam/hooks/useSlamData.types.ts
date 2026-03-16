import type { ParsedOccupancyGrid } from '../slam.types';

import type { ConnectionState } from '@/types/connection.types';

export interface UseSlamDataResult {
  grid: ParsedOccupancyGrid | null;
  connectionState: ConnectionState;
  fetchMap: () => void;
  isLoading: boolean;
}
