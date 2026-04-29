/** Default ICE servers: STUN for NAT traversal + TURN relay fallback for symmetric NAT.
 * @description Production deployments should override via VITE_TURN_URL, VITE_TURN_USERNAME,
 *  and VITE_TURN_CREDENTIAL environment variables. Free public TURN used for development.
 */

const STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const TURN_SERVERS: RTCIceServer[] = buildTurnServers();

function buildTurnServers(): RTCIceServer[] {
  const url = import.meta.env.VITE_TURN_URL as string | undefined;
  const username = import.meta.env.VITE_TURN_USERNAME as string | undefined;
  const credential = import.meta.env.VITE_TURN_CREDENTIAL as string | undefined;

  if (url && username && credential) {
    return [{ credential, urls: url, username }];
  }

  // Free public TURN for development — unreliable, rate-limited, no SLA
  return [
    {
      credential: 'openrelayproject',
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
    },
    {
      credential: 'openrelayproject',
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
    },
    {
      credential: 'openrelayproject',
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
    },
  ];
}

export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [...STUN_SERVERS, ...TURN_SERVERS];

/** ICE gathering timeout in ms. Increased from 3s to 5s for cellular networks with high RTT. */
export const ICE_GATHERING_TIMEOUT = 5000;

/** Max video bitrate in bps for bandwidth-constrained connections. */
export const MAX_VIDEO_BITRATE = 1_500_000;

export const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceCandidatePoolSize: 10,
  iceServers: DEFAULT_ICE_SERVERS,
};
