export interface UsePilotFullscreenReturn {
  readonly isFullscreen: boolean;
  readonly toggleFullscreen: () => void;
  readonly exitFullscreen: () => void;
}
