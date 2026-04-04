import type { VideoStreamStatus } from '@/types/streaming.types';

export interface UseWebRtcStreamOptions {
  readonly connected: boolean;
  readonly enabled: boolean;
  readonly onStatusChange?: (status: VideoStreamStatus) => void;
  readonly url: string;
}

export interface UseWebRtcStreamReturn {
  readonly status: VideoStreamStatus;
  readonly stream: MediaStream | null;
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly error: string | null;
  readonly retry: () => void;
}
