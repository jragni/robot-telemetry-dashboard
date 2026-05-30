import { useCallback, useEffect, useRef, useState } from 'react';

import { deriveWebRtcUrl } from '@/stores/connection/useConnectionStore.helpers';
import { SignalingClient } from '@/lib/webrtc/signaling';
import { calculateBackoffDelay, RECONNECT_MAX_ATTEMPTS } from '@/constants/reconnection';
import type { VideoStreamStatus } from '@/types/streaming.types';

import { ICE_GATHERING_TIMEOUT, MAX_VIDEO_BITRATE, PEER_CONNECTION_CONFIG } from './constants';
import { applyBandwidthConstraint } from './helpers';
import type { ConnectStep, UseWebRtcStreamOptions, UseWebRtcStreamReturn } from './types';

/** useWebRtcStream
 * @description Manages a WebRTC video stream connection with automatic reconnection.
 *  Handles SDP negotiation, ICE gathering, and connection state transitions.
 * @param options - Stream configuration including URL, enabled state, and callbacks.
 */
export function useWebRtcStream(options: UseWebRtcStreamOptions): UseWebRtcStreamReturn {
  const { connected, enabled, onStatusChange, url } = options;

  const [status, setStatus] = useState<VideoStreamStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);
  const shouldConnectRef = useRef(false);
  // Last user-visible error message — surfaced by the dedup warn so a discarded reconnect
  // attempt carries its cause forward instead of vanishing (T-163 follow-up).
  const lastErrorRef = useRef<string | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  // Read the latest onStatusChange via ref so transition — and the connect /
  // scheduleReconnect callbacks that close over it — keep a stable identity and
  // never capture a stale callback when a parent passes an unstable onStatusChange.
  const transition = useCallback((next: VideoStreamStatus) => {
    setStatus(next);
    onStatusChangeRef.current?.(next);
  }, []);

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
    setPc(null);
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!shouldConnectRef.current) return;
    // onconnectionstatechange ('failed'/'disconnected') and the connect() catch block
    // can both fire for a single failure. A pending timer means a reconnect is already
    // scheduled — bail so the retry budget isn't burned twice and no timer leaks. Log
    // the dedup so a stuck-state can be traced from a console transcript (T-163).
    if (reconnectTimerRef.current !== null) {
      console.warn(
        `[useWebRtcStream] scheduleReconnect dedup: reconnect already pending (attempts=${String(attemptsRef.current)}, last_error="${lastErrorRef.current ?? 'unknown'}")`,
      );
      return;
    }
    if (attemptsRef.current >= RECONNECT_MAX_ATTEMPTS) {
      setError(`Failed after ${String(RECONNECT_MAX_ATTEMPTS)} attempts`);
      transition('failed');
      return;
    }

    transition('reconnecting');
    attemptsRef.current += 1;

    const delay = calculateBackoffDelay(attemptsRef.current - 1);

    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectTimerRef.current = null;
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

    // Track which step failed so the catch block can log it with full stack context.
    // Without this, the 9-await connect path collapses every failure into one opaque
    // err.message and stuck-reconnecting states are undebuggable in production (T-162).
    let step: ConnectStep = 'init';

    try {
      step = 'create-peer-connection';
      const peerConnection = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
      pcRef.current = peerConnection;
      setPc(peerConnection);

      step = 'add-transceiver';
      peerConnection.addTransceiver('video', { direction: 'recvonly' });

      // Handle incoming video track (sync; no step bump).
      peerConnection.ontrack = (event) => {
        if (event.streams[0]) {
          setStream(event.streams[0]);
          transition('streaming');
          setError(null);
          attemptsRef.current = 0;
        }
      };

      // Handle connection state changes (sync; no step bump).
      peerConnection.onconnectionstatechange = () => {
        switch (peerConnection.connectionState) {
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

      step = 'create-offer';
      const offer = await peerConnection.createOffer();
      if (offer.sdp) {
        offer.sdp = applyBandwidthConstraint(offer.sdp, Math.round(MAX_VIDEO_BITRATE / 1000));
      }

      step = 'set-local-description';
      await peerConnection.setLocalDescription(offer);

      step = 'ice-gathering';
      // Distinguish ICE-complete from ICE-timed-out so a partial-candidates connect is
      // surfaced in the console — silent timeout used to hide degraded P2P paths.
      const iceComplete = await new Promise<boolean>((resolve) => {
        if (peerConnection.iceGatheringState === 'complete') {
          resolve(true);
          return;
        }
        const timeout = setTimeout(() => {
          resolve(false);
        }, ICE_GATHERING_TIMEOUT);
        peerConnection.onicegatheringstatechange = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            clearTimeout(timeout);
            resolve(true);
          }
        };
      });
      if (!iceComplete) {
        console.warn(
          `[useWebRtcStream] ICE gathering timed out after ${String(ICE_GATHERING_TIMEOUT)}ms — proceeding with partial candidates`,
        );
      }

      step = 'create-signaling-client';
      const signaling = new SignalingClient(signalingUrl);
      if (!peerConnection.localDescription) {
        // No silent return — log + surface as failure so the user isn't stuck on 'connecting'.
        console.error(
          '[useWebRtcStream] connect() aborted at step="create-signaling-client": missing localDescription',
        );
        lastErrorRef.current = 'missing localDescription';
        setError('Missing local description');
        transition('failed');
        return;
      }

      step = 'send-offer';
      const answer = await signaling.sendOffer(peerConnection.localDescription);

      // Guard: peer connection may have been torn down during async work. Leave a
      // breadcrumb so the race is visible in production console transcripts.
      if (pcRef.current !== peerConnection || peerConnection.signalingState === 'closed') {
        console.warn(
          '[useWebRtcStream] connect() aborted at step="send-offer": peer connection torn down mid-flight',
        );
        return;
      }

      step = 'set-remote-description';
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      // Boundary log — preserves the failing step and the full stack so production
      // failures are debuggable rather than collapsing into a single err.message (T-162).
      const message = err instanceof Error ? err.message : 'Connection failed';
      const stackOrMessage = err instanceof Error ? (err.stack ?? message) : String(err);
      console.error(`[useWebRtcStream] connect() failed at step="${step}":`, stackOrMessage);
      lastErrorRef.current = message;
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
    if (enabled && connected && url) {
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
  }, [connected, enabled, url]);

  return { status, stream, videoRef, error, retry, pc };
}
