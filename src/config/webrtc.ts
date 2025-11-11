/**
 * WebRTC Configuration
 *
 * Default configuration for WebRTC connections
 */

/**
 * Default STUN servers (Google's public STUN servers)
 * These help with NAT traversal for peer-to-peer connections
 */
export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
];

/**
 * Default WebRTC configuration
 */
export const WEBRTC_CONFIG = {
  /**
   * Default client name (will be overridden)
   */
  clientName: 'web-client',

  /**
   * Default room name
   */
  roomName: 'telemetry',

  /**
   * Auto-reconnect on connection loss
   */
  autoReconnect: true,

  /**
   * Initial reconnection interval (will use exponential backoff)
   */
  reconnectInterval: 2000, // 2 seconds

  /**
   * Maximum reconnection attempts (0 = infinite)
   */
  maxReconnectAttempts: 3,

  /**
   * ICE servers configuration
   */
  iceServers: DEFAULT_ICE_SERVERS,
} as const;

/**
 * RTCPeerConnection configuration
 */
export const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: DEFAULT_ICE_SERVERS,
  iceCandidatePoolSize: 10,
};

/**
 * Media constraints for receiving video
 */
export const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: true,
  audio: false, // Set to true if you want audio support
};

/**
 * WebSocket connection timeout (ms)
 */
export const WS_CONNECTION_TIMEOUT = 10000; // 10 seconds

/**
 * Maximum exponential backoff delay for reconnection (ms)
 */
export const MAX_RECONNECT_DELAY = 30000; // 30 seconds
