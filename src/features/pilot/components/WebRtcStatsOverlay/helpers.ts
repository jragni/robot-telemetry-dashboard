import type { BuildSnapshotInput, StatsSnapshot } from './WebRtcStatsOverlay.types';

/** detectDeployment
 * @description Classifies the connection URL as 'local' or 'cloud' for snapshot
 *  labeling. Treats localhost, 127.0.0.1, and *.local hostnames as local.
 * @param url - The rosbridge or WebRTC URL the dashboard is connected to.
 * @returns 'local' for loopback/mDNS targets, otherwise 'cloud'.
 */
export function detectDeployment(url: string): 'local' | 'cloud' {
  const lower = url.toLowerCase();
  const isLocal =
    lower.includes('localhost') || lower.includes('127.0.0.1') || /\.local(?:[:/]|$)/.test(lower);
  return isLocal ? 'local' : 'cloud';
}

/** buildStatsSnapshot
 * @description Shapes a WebRtcStats reading into the canonical snapshot JSON
 *  used for evidence export. Rounds floats to interview-friendly precision.
 * @param input - Latest stats, source URL, and stream start timestamp.
 * @returns A serializable snapshot object.
 */
export function buildStatsSnapshot({ stats, url, startedAtMs }: BuildSnapshotInput): StatsSnapshot {
  const resolution =
    stats.frameWidth !== null && stats.frameHeight !== null
      ? `${String(stats.frameWidth)}x${String(stats.frameHeight)}`
      : null;

  const jitterMs = stats.jitter !== null ? Math.round(stats.jitter * 1000 * 10) / 10 : null;
  const fps = stats.framesPerSecond !== null ? Math.round(stats.framesPerSecond * 10) / 10 : null;
  const packetLossRate =
    stats.packetLossRate !== null ? Math.round(stats.packetLossRate * 10000) / 10000 : null;

  return {
    connectionState: stats.connectionState,
    deployment: detectDeployment(url),
    duration_seconds: Math.max(0, Math.round((Date.now() - startedAtMs) / 1000)),
    fps,
    framesDecoded: stats.framesDecoded,
    framesDropped: stats.framesDropped,
    jitter_ms: jitterMs,
    kbps: stats.kbps,
    packetLossRate,
    resolution,
    rtt_ms: stats.currentRoundTripTimeMs,
    timestamp: new Date().toISOString(),
  };
}

/** isStatsOverlayEnabled
 * @description Gates the overlay's render path. Always-on in dev builds; in
 *  production, requires the `webrtc-stats-debug=1` localStorage flag so it
 *  never leaks into shipped UI by default.
 * @returns true when the overlay should mount.
 */
export function isStatsOverlayEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem('webrtc-stats-debug') === '1';
  } catch {
    return false;
  }
}
