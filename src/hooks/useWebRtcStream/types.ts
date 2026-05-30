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
  readonly pc: RTCPeerConnection | null;
}

/** ConnectStep
 * Type-checked union of connect() instrumentation steps. A typo or a new await
 * added without a matching step assignment fails the TypeScript compile, so
 * T-162's step-context logging cannot silently drift out of date.
 */
export type ConnectStep =
  | 'init'
  | 'create-peer-connection'
  | 'add-transceiver'
  | 'create-offer'
  | 'set-local-description'
  | 'ice-gathering'
  | 'create-signaling-client'
  | 'send-offer'
  | 'set-remote-description';
