import { useRef, useState, useEffect } from 'react';

import type { LidarRenderData } from '@/features/telemetry/lidar/lidar.types';
import { renderLidarFrame } from '@/features/telemetry/lidar/lidar.utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_SCALE = 50; // pixels per metre
const MIN_SCALE = 10;
const MAX_SCALE = 300;
const SCALE_STEP = 10;

// ---------------------------------------------------------------------------
// useLidarCanvas
// ---------------------------------------------------------------------------

export interface UseLidarCanvasResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  zoomIn: () => void;
  zoomOut: () => void;
}

/**
 * Manages a canvas ref and renders LiDAR data onto it whenever data or scale
 * changes.
 *
 * Returns a ref to attach to a <canvas> element, the current scale value,
 * a raw setter, and convenience zoom-in / zoom-out helpers.
 */
export function useLidarCanvas(
  data: LidarRenderData | null,
  width: number,
  height: number
): UseLidarCanvasResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState<number>(DEFAULT_SCALE);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const ctx = canvas.getContext('2d');
    if (ctx === null) return;

    if (data === null) {
      // Clear to blank when there is no data yet.
      ctx.clearRect(0, 0, width, height);
      return;
    }

    renderLidarFrame(ctx, data, width, height, scale);
  }, [data, scale, width, height]);

  const zoomIn = () =>
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));

  const zoomOut = () =>
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));

  return { canvasRef, scale, setScale, zoomIn, zoomOut };
}
