import type { VideoStreamStatus } from '@/types/streaming.types';

/** UseWebRtcStreamOptions
 * @description Configuration for the useWebRtcStream hook.
 */
export interface UseWebRtcStreamOptions {
  /** Base URL of the robot proxy (e.g., ws://192.168.1.10). */
  readonly url: string;
  /** Whether the stream should be active. */
  readonly enabled: boolean;
  /** Callback fired on every status transition. */
  readonly onStatusChange?: (status: VideoStreamStatus) => void;
}

/** UseWebRtcStreamReturn
 * @description Return type for the useWebRtcStream hook.
 */
export interface UseWebRtcStreamReturn {
  readonly status: VideoStreamStatus;
  readonly stream: MediaStream | null;
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly error: string | null;
  readonly retry: () => void;
}
