import { useCallback, useEffect, useRef, useState } from 'react';

import { deriveWebRtcUrl } from '@/stores/connection/useConnectionStore.helpers';
import { SignalingClient } from '@/lib/webrtc/signaling';
import {
  calculateBackoffDelay,
  RECONNECT_MAX_ATTEMPTS,
} from '@/constants/reconnection';
import type { VideoStreamStatus } from '@/types/streaming.types';

import { ICE_GATHERING_TIMEOUT, PEER_CONNECTION_CONFIG } from './constants';
import type { UseWebRtcStreamOptions, UseWebRtcStreamReturn } from './types';

export function useWebRtcStream(options: UseWebRtcStreamOptions): UseWebRtcStreamReturn {
  const { url, enabled, onStatusChange } = options;

  const [status, setStatus] = useState<VideoStreamStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);
  const shouldConnectRef = useRef(false);

  const transition = useCallback(
    (next: VideoStreamStatus) => {
      setStatus(next);
      onStatusChange?.(next);
    },
    [onStatusChange],
  );

  const teardown = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setStream(null);
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!shouldConnectRef.current) return;
    if (attemptsRef.current >= RECONNECT_MAX_ATTEMPTS) {
      setError(`Failed after ${String(RECONNECT_MAX_ATTEMPTS)} attempts`);
      transition('failed');
      return;
    }

    transition('reconnecting');
    attemptsRef.current += 1;

    const delay = calculateBackoffDelay(attemptsRef.current - 1);

    reconnectTimerRef.current = window.setTimeout(() => {
      void connect();
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);

  const connect = useCallback(async () => {
    const signalingUrl = deriveWebRtcUrl(url);
    if (!signalingUrl) return;

    teardown();
    transition('connecting');
    setError(null);
    shouldConnectRef.current = true;

    try {
      // 1. Create peer connection
      const pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
      pcRef.current = pc;

      // 2. Add recvonly video transceiver — tells aiortc we want video
      pc.addTransceiver('video', { direction: 'recvonly' });

      // 3. Handle incoming video track
      pc.ontrack = (event) => {
        if (event.streams[0]) {
          setStream(event.streams[0]);
          transition('streaming');
          setError(null);
          attemptsRef.current = 0;
        }
      };

      // 4. Handle connection state changes
      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case 'disconnected':
          case 'failed':
            setStream(null);
            if (shouldConnectRef.current) scheduleReconnect();
            break;
          case 'closed':
            setStream(null);
            break;
        }
      };

      // 5. Create SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 6. Wait for ICE gathering (or timeout)
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
          return;
        }
        const timeout = setTimeout(resolve, ICE_GATHERING_TIMEOUT);
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') {
            clearTimeout(timeout);
            resolve();
          }
        };
      });

      // 7. Send offer to aiortc, get answer
      const signaling = new SignalingClient(signalingUrl);
      if (!pc.localDescription) return;
      const answer = await signaling.sendOffer(pc.localDescription);

      // 8. Guard: peer connection may have been torn down during async work
      if (pcRef.current !== pc || pc.signalingState === 'closed') return;

      // 9. Set remote description — video should start flowing
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      // shouldConnectRef may have been set to false by cleanup during async gap
      if (shouldConnectRef.current as boolean) {
        scheduleReconnect();
      } else {
        transition('failed');
      }
    }
  }, [url, teardown, transition, scheduleReconnect]);

  const retry = useCallback(() => {
    attemptsRef.current = 0;
    void connect();
  }, [connect]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.play().catch(() => {
      // Autoplay may be blocked — user interaction required
    });

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    if (enabled && url) {
      void connect();
    } else {
      shouldConnectRef.current = false;
      teardown();
      transition('idle');
      setError(null);
      attemptsRef.current = 0;
    }

    return () => {
      shouldConnectRef.current = false;
      teardown();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, url]);

  return { status, stream, videoRef, error, retry };
}
