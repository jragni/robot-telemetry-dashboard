export interface UseZoomConfig {
  min: number;
  max: number;
  step: number;
  initial?: number;
}

export interface UseZoomReturn {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  handleWheel: (e: React.WheelEvent) => void;
}
