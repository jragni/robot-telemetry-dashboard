import type { WebRtcStats } from '@/hooks';

export interface WebRtcStatsOverlayProps {
  readonly pc: RTCPeerConnection | null;
  readonly url: string;
}

export interface StatsSnapshot {
  readonly timestamp: string;
  readonly deployment: 'local' | 'cloud';
  readonly fps: number | null;
  readonly resolution: string | null;
  readonly rtt_ms: number | null;
  readonly kbps: number | null;
  readonly jitter_ms: number | null;
  readonly framesDropped: number | null;
  readonly framesDecoded: number | null;
  readonly packetLossRate: number | null;
  readonly duration_seconds: number;
  readonly connectionState: string;
}

export interface BuildSnapshotInput {
  readonly stats: WebRtcStats;
  readonly url: string;
  readonly startedAtMs: number;
}

export interface StatRowProps {
  readonly label: string;
  readonly value: string;
}
