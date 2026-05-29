import { useEffect, useRef, useState } from 'react';

import { DEFAULT_STATS_INTERVAL_MS } from './constants';
import type {
  CandidatePairReport,
  InboundRtpVideoReport,
  PreviousSample,
  WebRtcStats,
} from './types';

/** useWebRtcStats
 * @description Polls RTCPeerConnection.getStats() on a fixed interval and returns
 *  the latest snapshot of video-stream quality metrics (FPS, kbps, RTT, jitter,
 *  packet loss). Returns null until the first successful poll. Stops polling and
 *  clears state when the peer connection becomes null or the hook unmounts.
 * @param pc - The active RTCPeerConnection, or null when no stream is active.
 * @param intervalMs - Poll interval in milliseconds. Defaults to 1000ms.
 * @returns Latest stats snapshot, or null before the first poll completes.
 */
export function useWebRtcStats(
  pc: RTCPeerConnection | null,
  intervalMs: number = DEFAULT_STATS_INTERVAL_MS,
): WebRtcStats | null {
  const [stats, setStats] = useState<WebRtcStats | null>(null);
  const previousSampleRef = useRef<PreviousSample | null>(null);

  useEffect(() => {
    if (!pc) return;

    let cancelled = false;

    const poll = async (): Promise<void> => {
      try {
        const report = await pc.getStats();
        if (cancelled) return;

        const next = buildStats(report, pc, previousSampleRef.current);
        if (next) {
          previousSampleRef.current = {
            bytesReceived: next.bytesReceived ?? 0,
            timestamp: next.timestamp,
          };
          setStats(next);
        }
      } catch {
        // getStats can throw if the pc is closing mid-poll — swallow and wait
      }
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      previousSampleRef.current = null;
      setStats(null);
    };
  }, [pc, intervalMs]);

  return stats;
}

function buildStats(
  report: RTCStatsReport,
  pc: RTCPeerConnection,
  previous: PreviousSample | null,
): WebRtcStats | null {
  let inbound: InboundRtpVideoReport | null = null;
  let candidatePair: CandidatePairReport | null = null;

  report.forEach((entry: unknown) => {
    const stat = entry as { type?: string; kind?: string; mediaType?: string };
    if (stat.type === 'inbound-rtp' && (stat.kind === 'video' || stat.mediaType === 'video')) {
      inbound = stat as InboundRtpVideoReport;
    }
    if (stat.type === 'candidate-pair') {
      const pair = stat as CandidatePairReport;
      const isSucceeded = pair.state === 'succeeded';
      // Prefer nominated succeeded pair; fall back to any succeeded pair.
      if (isSucceeded && (pair.nominated === true || !candidatePair)) {
        candidatePair = pair;
      }
    }
  });

  const now = Date.now();
  const bytesReceived = (inbound as InboundRtpVideoReport | null)?.bytesReceived ?? null;
  const kbps = computeKbps(bytesReceived, previous, now);
  const rttSeconds = (candidatePair as CandidatePairReport | null)?.currentRoundTripTime;
  const rttMs = typeof rttSeconds === 'number' ? Math.round(rttSeconds * 1000) : null;
  const packetsLost = (inbound as InboundRtpVideoReport | null)?.packetsLost ?? null;
  const packetsReceived = (inbound as InboundRtpVideoReport | null)?.packetsReceived ?? null;
  const packetLossRate = computePacketLossRate(packetsLost, packetsReceived);

  const inboundCast = inbound as InboundRtpVideoReport | null;

  return {
    bytesReceived,
    connectionState: pc.connectionState,
    currentRoundTripTimeMs: rttMs,
    frameHeight: inboundCast?.frameHeight ?? null,
    framesDecoded: inboundCast?.framesDecoded ?? null,
    framesDropped: inboundCast?.framesDropped ?? null,
    framesPerSecond: inboundCast?.framesPerSecond ?? null,
    framesReceived: inboundCast?.framesReceived ?? null,
    frameWidth: inboundCast?.frameWidth ?? null,
    iceConnectionState: pc.iceConnectionState,
    jitter: inboundCast?.jitter ?? null,
    kbps,
    packetLossRate,
    packetsLost,
    packetsReceived,
    timestamp: now,
  };
}

function computeKbps(
  bytesReceived: number | null,
  previous: PreviousSample | null,
  now: number,
): number | null {
  if (bytesReceived === null || !previous) return null;
  const deltaBytes = bytesReceived - previous.bytesReceived;
  const deltaSeconds = (now - previous.timestamp) / 1000;
  if (deltaSeconds <= 0) return null;
  const bitsPerSecond = (deltaBytes * 8) / deltaSeconds;
  return Math.max(0, Math.round(bitsPerSecond / 1000));
}

function computePacketLossRate(
  packetsLost: number | null,
  packetsReceived: number | null,
): number | null {
  if (packetsLost === null || packetsReceived === null) return null;
  const total = packetsLost + packetsReceived;
  if (total <= 0) return 0;
  return packetsLost / total;
}
