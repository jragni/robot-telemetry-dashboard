import { useRef } from 'react';
import type { VideoStreamStatus } from '../types/PilotView.types';

/** UseWebRtcStreamReturn
 * @description Return type for the useWebRtcStream hook.
 */
export interface UseWebRtcStreamReturn {
  readonly status: VideoStreamStatus;
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly error: string | null;
  readonly retry: () => void;
}

/** useWebRtcStream
 * @description Manages the WebRTC peer connection lifecycle for camera video
 *  streaming. Connects to a webrtc_ros signaling endpoint, negotiates SDP
 *  offer/answer, and attaches the resulting MediaStream to a video element.
 *
 *  STUB: Returns idle state until pair-programmed with real WebRTC integration.
 *
 * @param _robotUrl - The robot's rosbridge WebSocket URL (used to derive signaling URL).
 * @param _enabled - Whether the stream should be active.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useWebRtcStream(robotUrl: string, enabled: boolean): UseWebRtcStreamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // TODO: Pair-program — RTCPeerConnection lifecycle, signaling WebSocket,
  // ICE candidate exchange, MediaStream attachment, connection state monitoring

  return {
    status: 'idle',
    videoRef,
    error: null,
    retry: () => {
      // No-op until WebRTC is wired
    },
  };
}
