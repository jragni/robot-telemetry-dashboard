export const WEBRTC_PATH = '/webrtc' as const;

export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export const WEBRTC_CONFIG = {
  /** Maximum number of reconnect attempts before giving up. */
  maxReconnectAttempts: 3,
  /** Initial delay in milliseconds before the first reconnect attempt. */
  initialReconnectDelay: 2000,
  /** Maximum backoff ceiling in milliseconds for exponential retry delays. */
  maxReconnectDelay: 30000,
  /** Milliseconds to wait for a peer connection to reach a connected state. */
  connectionTimeout: 15000,
} as const;
