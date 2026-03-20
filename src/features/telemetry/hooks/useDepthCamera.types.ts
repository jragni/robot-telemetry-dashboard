import type { ColormapType } from '../utils/applyColormap';

export interface UseDepthCameraResult {
  hasFrame: boolean;
  error: string | null;
  fps: number | null;
}

export interface UseDepthCameraOptions {
  robotId: string;
  topicName: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  colormap?: ColormapType;
}
