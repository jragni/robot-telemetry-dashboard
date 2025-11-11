/**
 * LidarZoomContext
 *
 * Shared context for LIDAR zoom level across dashboard and pilot mode.
 * Allows zoom synchronization between LidarCard and PilotLidarMinimap.
 */

import { createContext, useContext, useState } from 'react';

import {
  DEFAULT_VIEW_RANGE,
  MIN_VIEW_RANGE,
  ZOOM_STEP,
  type LidarZoomContextValue,
  type LidarZoomProviderProps,
} from './definitions';

const LidarZoomContext = createContext<LidarZoomContextValue | undefined>(
  undefined
);

export function LidarZoomProvider({ children }: LidarZoomProviderProps) {
  const [viewRange, setViewRange] = useState(DEFAULT_VIEW_RANGE);

  const zoomIn = () => {
    setViewRange((prev) => Math.max(MIN_VIEW_RANGE, prev - ZOOM_STEP));
  };

  const zoomOut = (maxRange = 50) => {
    setViewRange((prev) => Math.min(maxRange, prev + ZOOM_STEP));
  };

  const canZoomIn = viewRange > MIN_VIEW_RANGE;

  const canZoomOut = (maxRange = 50) => viewRange < maxRange;

  return (
    <LidarZoomContext.Provider
      value={{
        viewRange,
        setViewRange,
        zoomIn,
        zoomOut,
        canZoomIn,
        canZoomOut,
        DEFAULT_VIEW_RANGE,
        MIN_VIEW_RANGE,
        ZOOM_STEP,
      }}
    >
      {children}
    </LidarZoomContext.Provider>
  );
}

export function useLidarZoom() {
  const context = useContext(LidarZoomContext);
  if (context === undefined) {
    throw new Error('useLidarZoom must be used within a LidarZoomProvider');
  }
  return context;
}
