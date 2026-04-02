import type { VideoStreamStatus } from '@/types/streaming.types';

export interface UseWebRtcStreamOptions {
  readonly url: string;
  readonly enabled: boolean;
  readonly onStatusChange?: (status: VideoStreamStatus) => void;
}

export interface UseWebRtcStreamReturn {
  readonly status: VideoStreamStatus;
  readonly stream: MediaStream | null;
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly error: string | null;
  readonly retry: () => void;
}
