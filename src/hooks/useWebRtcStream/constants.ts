/** Default STUN servers for NAT traversal. */
export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

/** RTCPeerConnection configuration. */
export const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: DEFAULT_ICE_SERVERS,
  iceCandidatePoolSize: 10,
};

/** ICE gathering timeout in ms. */
export const ICE_GATHERING_TIMEOUT = 3000;
