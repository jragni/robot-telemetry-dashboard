export interface WebRtcStats {
  readonly framesPerSecond: number | null;
  readonly frameWidth: number | null;
  readonly frameHeight: number | null;
  readonly framesReceived: number | null;
  readonly framesDecoded: number | null;
  readonly framesDropped: number | null;
  readonly bytesReceived: number | null;
  readonly kbps: number | null;
  readonly jitter: number | null;
  readonly currentRoundTripTimeMs: number | null;
  readonly packetsLost: number | null;
  readonly packetsReceived: number | null;
  readonly packetLossRate: number | null;
  readonly connectionState: RTCPeerConnectionState;
  readonly iceConnectionState: RTCIceConnectionState;
  readonly timestamp: number;
}

export interface PreviousSample {
  readonly bytesReceived: number;
  readonly timestamp: number;
}

export interface InboundRtpVideoReport {
  readonly type: 'inbound-rtp';
  readonly kind?: string;
  readonly mediaType?: string;
  readonly framesPerSecond?: number;
  readonly frameWidth?: number;
  readonly frameHeight?: number;
  readonly framesReceived?: number;
  readonly framesDecoded?: number;
  readonly framesDropped?: number;
  readonly bytesReceived?: number;
  readonly jitter?: number;
  readonly packetsLost?: number;
  readonly packetsReceived?: number;
}

export interface CandidatePairReport {
  readonly type: 'candidate-pair';
  readonly state?: string;
  readonly nominated?: boolean;
  readonly currentRoundTripTime?: number;
}
