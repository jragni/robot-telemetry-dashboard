/**
 * useWebRTC Hook
 *
 * Custom hook for managing WebRTC connection lifecycle with opentera-webrtc-ros
 */

import { useEffect, useRef, useState } from 'react';

import {
  MAX_RECONNECT_DELAY,
  PEER_CONNECTION_CONFIG,
  WEBRTC_CONFIG,
} from '@/config/webrtc';
import { SignalingClient } from '@/lib/webrtc/signaling';
import type { WebRTCConnectionState } from '@/types/webrtc';

interface UseWebRTCOptions {
  /**
   * Signaling server URL (e.g., wss://robot.loca.lt/webrtc)
   */
  url?: string;

  /**
   * Auto-connect when URL is available
   */
  autoConnect?: boolean;
}

interface UseWebRTCReturn {
  stream: MediaStream | null;
  connectionState: WebRTCConnectionState;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

export function useWebRTC(options: UseWebRTCOptions = {}): UseWebRTCReturn {
  const { url, autoConnect = false } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<WebRTCConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  const signalingRef = useRef<SignalingClient | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldConnectRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false); // Prevent concurrent connections

  /**
   * Clear reconnection timeout
   */
  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  /**
   * Calculate exponential backoff delay
   */
  const getReconnectDelay = (): number => {
    const baseDelay = WEBRTC_CONFIG.reconnectInterval;
    const attempt = reconnectAttemptsRef.current;
    const delay = Math.min(
      baseDelay * Math.pow(2, attempt),
      MAX_RECONNECT_DELAY
    );
    return delay;
  };

  /**
   * Create RTCPeerConnection
   */
  const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);

    // Handle incoming media tracks
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind, {
        trackId: event.track.id,
        trackLabel: event.track.label,
        trackEnabled: event.track.enabled,
        trackMuted: event.track.muted,
        trackReadyState: event.track.readyState,
      });

      // Listen for unmute event (when track starts receiving data)
      event.track.onmute = () => {
        console.warn('Track muted:', event.track.id);
      };

      event.track.onunmute = () => {
        console.log(
          'Track unmuted! Video should now be visible:',
          event.track.id
        );
      };

      if (event.streams?.[0]) {
        console.log('Setting remote stream', {
          streamId: event.streams[0].id,
          videoTracks: event.streams[0].getVideoTracks().length,
          audioTracks: event.streams[0].getAudioTracks().length,
        });
        setStream(event.streams[0]);
        setConnectionState('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
      }
    };

    // Handle ICE candidates (embedded in SDP for aiortc)
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate.candidate);
      } else {
        console.log('ICE gathering complete');
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Peer connection state:', pc.connectionState);

      switch (pc.connectionState) {
        case 'connected':
          setConnectionState('connected');
          setError(null);
          reconnectAttemptsRef.current = 0;
          isConnectingRef.current = false; // Connection fully established
          break;

        case 'disconnected':
          setConnectionState('disconnected');
          setStream(null);
          // Try to reconnect
          if (WEBRTC_CONFIG.autoReconnect && shouldConnectRef.current) {
            attemptReconnect();
          }
          break;

        case 'failed':
          setConnectionState('error');
          setError(new Error('Peer connection failed'));
          setStream(null);
          // Try to reconnect
          if (WEBRTC_CONFIG.autoReconnect && shouldConnectRef.current) {
            attemptReconnect();
          }
          break;

        case 'closed':
          setConnectionState('disconnected');
          setStream(null);
          break;
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    return pc;
  };

  /**
   * Initiate WebRTC connection by sending offer
   */
  const initiateConnection = async () => {
    try {
      // Close existing peer connection if present to avoid transceiver duplication
      if (peerConnectionRef.current) {
        console.log('Closing existing peer connection before reconnecting');
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Create fresh peer connection
      peerConnectionRef.current = createPeerConnection();
      const pc = peerConnectionRef.current;

      // Add transceiver for receiving video from server
      // This ensures the SDP offer includes a video media section with recvonly direction
      // Without this, aiortc fails with "None is not in list" during answer negotiation
      pc.addTransceiver('video', { direction: 'recvonly' });
      console.log('Added recvonly video transceiver');

      console.log('Creating SDP offer...');

      // Create offer (we initiate with aiortc, not the robot)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete (or timeout)
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const timeout = setTimeout(() => {
            resolve(); // Continue even if not complete
          }, 3000);

          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') {
              clearTimeout(timeout);
              resolve();
            }
          };
        }
      });

      console.log('Sending offer to server...');

      // Send offer to server and get answer
      const answer = await signalingRef.current?.sendOffer(
        pc.localDescription!
      );

      if (!answer) {
        throw new Error('No answer received from server');
      }

      // Check if this PC is still the current one (might have been replaced during async operation)
      if (peerConnectionRef.current !== pc) {
        console.log(
          'Peer connection was replaced during offer/answer exchange, ignoring answer'
        );
        isConnectingRef.current = false;
        return;
      }

      // Check if PC was closed during async operation
      if (pc.signalingState === 'closed') {
        console.log(
          'Peer connection was closed during offer/answer exchange, ignoring answer'
        );
        isConnectingRef.current = false;
        return;
      }

      console.log('Setting remote description (answer)...');

      // Set remote description (answer from server)
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      console.log('WebRTC connection established!');
      isConnectingRef.current = false; // Connection succeeded
    } catch (err) {
      console.error('Error initiating WebRTC connection:', err);
      setError(err as Error);
      setConnectionState('error');
      isConnectingRef.current = false; // Connection failed

      if (WEBRTC_CONFIG.autoReconnect && shouldConnectRef.current) {
        attemptReconnect();
      }
    }
  };

  /**
   * Attempt reconnection with exponential backoff
   */
  const attemptReconnect = () => {
    if (!shouldConnectRef.current) return;

    const maxAttempts = WEBRTC_CONFIG.maxReconnectAttempts;
    if (maxAttempts > 0 && reconnectAttemptsRef.current >= maxAttempts) {
      console.error('Max reconnection attempts reached');
      setConnectionState('error');
      setError(new Error('Max reconnection attempts reached'));
      return;
    }

    setConnectionState('reconnecting');
    reconnectAttemptsRef.current += 1;

    const delay = getReconnectDelay();
    console.log(
      `Attempting reconnection in ${delay}ms (attempt ${reconnectAttemptsRef.current})`
    );

    clearReconnectTimeout();
    reconnectTimeoutRef.current = window.setTimeout(() => {
      void connect();
    }, delay);
  };

  /**
   * Connect to WebRTC signaling server and establish peer connection
   */
  const connect = async () => {
    if (!url) {
      setError(new Error('WebRTC signaling URL is required'));
      setConnectionState('error');
      return;
    }

    // Don't start a new connection if already connected or connecting
    if (
      isConnectingRef.current ||
      connectionState === 'connected' ||
      connectionState === 'connecting'
    ) {
      console.log('Already connected or connecting, skipping', {
        isConnecting: isConnectingRef.current,
        connectionState,
      });
      return;
    }

    // Set this IMMEDIATELY to block concurrent calls
    isConnectingRef.current = true;
    console.log('useWebRTC: Starting connection...');

    try {
      clearReconnectTimeout();
      setConnectionState('connecting');
      setError(null);
      shouldConnectRef.current = true;

      // Create signaling client
      if (!signalingRef.current) {
        signalingRef.current = new SignalingClient(url);

        // Set up signaling event listeners
        signalingRef.current.on('connected', () => {
          console.log('Signaling connected, initiating WebRTC...');
          void initiateConnection();
        });

        signalingRef.current.on('disconnected', () => {
          console.log('Signaling disconnected');
          if (WEBRTC_CONFIG.autoReconnect && shouldConnectRef.current) {
            attemptReconnect();
          }
        });

        signalingRef.current.on('error', (err) => {
          console.error('Signaling error:', err);
          setError(err);
          setConnectionState('error');

          if (WEBRTC_CONFIG.autoReconnect && shouldConnectRef.current) {
            attemptReconnect();
          }
        });
      }

      // Connect to signaling server (this will trigger initiateConnection)
      await signalingRef.current.connect();
    } catch (err) {
      console.error('Failed to connect to WebRTC:', err);
      setError(err as Error);
      setConnectionState('error');
      isConnectingRef.current = false; // Reset on error

      if (WEBRTC_CONFIG.autoReconnect && shouldConnectRef.current) {
        attemptReconnect();
      }
    }
  };

  /**
   * Disconnect from WebRTC
   */
  const disconnect = () => {
    console.log('useWebRTC: Disconnecting');
    shouldConnectRef.current = false;
    isConnectingRef.current = false; // Reset connection lock
    clearReconnectTimeout();
    reconnectAttemptsRef.current = 0;

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // For REST-based signaling, no need to disconnect the client
    // Keep it ready for reconnection

    setStream(null);
    setConnectionState('disconnected');
    setError(null);
  };

  // Auto-connect when URL becomes available
  useEffect(() => {
    if (autoConnect && url && !signalingRef.current) {
      void connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldConnectRef.current = false;
      clearReconnectTimeout();

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      if (signalingRef.current) {
        signalingRef.current.disconnect();
      }
    };
  }, []);

  return {
    stream,
    connectionState,
    error,
    connect: () => {
      void connect();
    },
    disconnect,
  };
}
