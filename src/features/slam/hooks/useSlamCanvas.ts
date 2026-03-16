import * as d3 from 'd3';
import { useRef, useEffect } from 'react';

import type { ZoomTransform } from '../slam.types';
import { renderOccupancyGrid, renderRobotMarker } from '../slam.utils';

import type {
  UseSlamCanvasOptions,
  UseSlamCanvasResult,
} from './useSlamCanvas.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZOOM_SCALE_EXTENT: [number, number] = [0.5, 20];
const IDENTITY_TRANSFORM: ZoomTransform = { k: 1, x: 0, y: 0 };

// ---------------------------------------------------------------------------
// useSlamCanvas
// ---------------------------------------------------------------------------

/**
 * Manages a Canvas 2D element for SLAM map rendering with d3-zoom.
 *
 * - Attaches a d3-zoom behaviour to the canvas for smooth pan/zoom.
 * - Stores the current zoom transform in a ref (not state) to avoid
 *   re-renders on every pan/zoom tick — only the canvas pixels update.
 * - Re-renders whenever `grid` or `robotPosition` changes.
 * - Double-click resets the view to the identity transform.
 */
export function useSlamCanvas(
  options: UseSlamCanvasOptions
): UseSlamCanvasResult {
  const { grid, robotPosition } = options;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store the d3-zoom transform in a ref so pan/zoom does not trigger
  // React state updates and unnecessary component re-renders.
  const transformRef = useRef<ZoomTransform>(IDENTITY_TRANSFORM);

  // ---------------------------------------------------------------------------
  // Render helper — draws grid + robot marker using the current transform
  // ---------------------------------------------------------------------------
  const renderFrame = () => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const ctx = canvas.getContext('2d');
    if (ctx === null) return;

    const { width, height } = canvas;
    const transform = transformRef.current;

    if (grid === null) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    renderOccupancyGrid(ctx, grid, width, height, transform);

    if (robotPosition !== null) {
      renderRobotMarker(ctx, robotPosition, grid, transform);
    }
  };

  // ---------------------------------------------------------------------------
  // Attach d3-zoom to canvas
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent(ZOOM_SCALE_EXTENT)
      .on('zoom', (event: d3.D3ZoomEvent<HTMLCanvasElement, unknown>) => {
        const t = event.transform;
        transformRef.current = { k: t.k, x: t.x, y: t.y };
        renderFrame();
      });

    const selection = d3.select(canvas);

    selection.call(zoom);

    // Double-click resets to identity
    selection.on('dblclick.zoom', () => {
      selection
        .transition()
        .duration(300)
        // eslint-disable-next-line @typescript-eslint/unbound-method -- d3-zoom API pattern
        .call(zoom.transform, d3.zoomIdentity);
    });

    return () => {
      selection.on('.zoom', null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Re-render when grid or robot position data changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    renderFrame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, robotPosition]);

  return { canvasRef };
}
