/**
 * WebRTC Type Definitions
 *
 * Type definitions for WebRTC video streaming with aiortc
 */

/**
 * WebRTC connection states
 */
export type WebRTCConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * Configuration for WebRTC connection
 */
export interface WebRTCConfig {
  /**
   * HTTP/HTTPS URL for signaling server (derived from base URL)
   */
  signalingUrl: string;

  /**
   * Client name (identifier for this web client)
   */
  clientName?: string;

  /**
   * ICE servers configuration (STUN/TURN)
   */
  iceServers?: RTCIceServer[];

  /**
   * Auto-reconnect on connection loss
   */
  autoReconnect?: boolean;

  /**
   * Reconnection interval in milliseconds
   */
  reconnectInterval?: number;

  /**
   * Maximum reconnection attempts (0 = infinite)
   */
  maxReconnectAttempts?: number;
}

/**
 * WebRTC stream state
 */
export interface WebRTCStreamState {
  /**
   * Current MediaStream from peer
   */
  stream: MediaStream | null;

  /**
   * Connection state
   */
  connectionState: WebRTCConnectionState;

  /**
   * Error if connection failed
   */
  error: Error | null;

  /**
   * Number of reconnection attempts
   */
  reconnectAttempts: number;
}

/**
 * WebRTC Context value interface
 */
export interface WebRTCContextValue {
  stream: MediaStream | null;
  connectionState: WebRTCConnectionState;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * WebRTC Provider props
 */
export interface WebRTCProviderProps {
  children: React.ReactNode;
}
