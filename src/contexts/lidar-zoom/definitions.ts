/**
 * LidarZoom Type Definitions
 */

export const DEFAULT_VIEW_RANGE = 5; // Default 5 meter view range
export const MIN_VIEW_RANGE = 2; // Minimum 2 meter view range
export const ZOOM_STEP = 2; // Zoom in/out by 2 meters

export interface LidarZoomContextValue {
  viewRange: number;
  setViewRange: (range: number) => void;
  zoomIn: () => void;
  zoomOut: (maxRange?: number) => void;
  canZoomIn: boolean;
  canZoomOut: (maxRange?: number) => boolean;
  DEFAULT_VIEW_RANGE: number;
  MIN_VIEW_RANGE: number;
  ZOOM_STEP: number;
}

export interface LidarZoomProviderProps {
  children: React.ReactNode;
}
