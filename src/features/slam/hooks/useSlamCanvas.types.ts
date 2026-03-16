import type { RefObject } from 'react';

import type { ParsedOccupancyGrid, RobotPosition } from '../slam.types';

export interface UseSlamCanvasOptions {
  grid: ParsedOccupancyGrid | null;
  robotPosition: RobotPosition | null;
}

export interface UseSlamCanvasResult {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}
