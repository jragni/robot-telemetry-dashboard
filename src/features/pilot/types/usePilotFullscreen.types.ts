/** UsePilotFullscreenReturn
 * @description Return type for the usePilotFullscreen hook.
 */
export interface UsePilotFullscreenReturn {
  readonly isFullscreen: boolean;
  readonly toggleFullscreen: () => void;
  readonly exitFullscreen: () => void;
}
