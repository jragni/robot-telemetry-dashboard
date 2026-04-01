import type { VideoStreamStatus } from './PilotView.types';

/** UseWebRtcStreamReturn
 * @description Return type for the useWebRtcStream hook.
 */
export interface UseWebRtcStreamReturn {
  readonly status: VideoStreamStatus;
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly error: string | null;
  readonly retry: () => void;
}
