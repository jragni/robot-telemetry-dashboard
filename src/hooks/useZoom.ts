import { useState, useCallback } from 'react';

interface UseZoomConfig {
  min: number;
  max: number;
  step: number;
  initial?: number;
}

interface UseZoomReturn {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  handleWheel: (e: React.WheelEvent) => void;
}

/** useZoom
 * @description Manages a clamped zoom level with mouse-wheel support. Provides zoomIn,
 *  zoomOut, and handleWheel callbacks that clamp the zoom level between min and max.
 * @param config - Zoom configuration with min, max, step, and optional initial value.
 * @returns Object with current zoom level and zoom control callbacks.
 */
export function useZoom({ min, max, step, initial = 1 }: UseZoomConfig): UseZoomReturn {
  const [zoom, setZoom] = useState(initial);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(max, prev + step));
  }, [max, step]);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(min, prev - step));
  }, [min, step]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setZoom((prev) =>
        Math.min(max, Math.max(min, prev + (e.deltaY > 0 ? -step : step))),
      );
    },
    [min, max, step],
  );

  return { zoom, zoomIn, zoomOut, handleWheel };
}
