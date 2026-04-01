import { useRef } from 'react';
import type { UseWebRtcStreamReturn } from '../types/useWebRtcStream.types';

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
export function useWebRtcStream(robotUrl: string, enabled: boolean): UseWebRtcStreamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // TODO: Pair-program — RTCPeerConnection lifecycle, signaling WebSocket,
  // ICE candidate exchange, MediaStream attachment, connection state monitoring
  void robotUrl;
  void enabled;

  return {
    status: 'idle',
    videoRef,
    error: null,
    retry: () => {
      // No-op until WebRTC is wired
    },
  };
}
