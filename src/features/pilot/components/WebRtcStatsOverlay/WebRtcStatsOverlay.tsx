import { useCallback, useEffect, useRef, useState } from 'react';

import { useWebRtcStats } from '@/hooks';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { buildStatsSnapshot, isStatsOverlayEnabled } from './helpers';
import type { StatRowProps, WebRtcStatsOverlayProps } from './WebRtcStatsOverlay.types';

const COPY_RESET_MS = 1500;

/** WebRtcStatsOverlay
 * @description Debug-only overlay that displays live WebRTC stream stats
 *  (FPS, kbps, RTT, jitter, loss) in a fixed top-right panel. Provides a
 *  "Copy Stats Snapshot" button that emits a JSON evidence blob to the
 *  clipboard. Mounts only when `import.meta.env.DEV` is true or
 *  `localStorage.webrtc-stats-debug === '1'`.
 * @prop pc - The active RTCPeerConnection from useWebRtcStream, or null.
 * @prop url - The robot URL — used to label the snapshot as local vs cloud.
 */
export function WebRtcStatsOverlay({ pc, url }: WebRtcStatsOverlayProps) {
  const stats = useWebRtcStats(pc);
  const startedAtRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (stats && startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
    if (!stats) {
      startedAtRef.current = null;
    }
  }, [stats]);

  const handleCopy = useCallback(() => {
    if (!stats || startedAtRef.current === null) return;
    const snapshot = buildStatsSnapshot({
      startedAtMs: startedAtRef.current,
      stats,
      url,
    });
    void navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2)).then(() => {
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, COPY_RESET_MS);
    });
  }, [stats, url]);

  if (!isStatsOverlayEnabled()) return null;

  const isWaiting = !stats;
  const resolution =
    stats?.frameWidth !== null && stats?.frameWidth !== undefined && stats.frameHeight !== null
      ? `${String(stats.frameWidth)}x${String(stats.frameHeight)}`
      : '--';

  return (
    <aside
      aria-label="WebRTC stream diagnostics"
      className="fixed top-4 right-4 z-50 min-w-56 rounded-md border border-border bg-surface-base/85 px-3 py-2 font-mono text-xs text-text-primary shadow-lg backdrop-blur-sm"
    >
      <header className="flex items-center justify-between gap-3 pb-1.5 border-b border-border/60">
        <span className="font-sans text-xs uppercase tracking-widest text-text-muted">
          WebRTC Stats
        </span>
        <Button
          aria-label="Copy stats snapshot to clipboard"
          className="h-6 px-2 text-xs"
          disabled={isWaiting}
          onClick={handleCopy}
          size="sm"
          variant="ghost"
        >
          <Copy aria-hidden="true" className="size-3" />
          <span className="font-mono">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </header>

      {isWaiting ? (
        <p className="pt-2 text-text-muted">Waiting for stats…</p>
      ) : (
        <dl className="pt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 tabular-nums">
          <StatRow label="FPS" value={formatNumber(stats.framesPerSecond, 1)} />
          <StatRow label="Res" value={resolution} />
          <StatRow label="kbps" value={formatNumber(stats.kbps, 0)} />
          <StatRow label="RTT" value={formatMs(stats.currentRoundTripTimeMs)} />
          <StatRow label="Jitter" value={formatJitter(stats.jitter)} />
          <StatRow label="Dropped" value={formatNumber(stats.framesDropped, 0)} />
          <StatRow label="Decoded" value={formatNumber(stats.framesDecoded, 0)} />
          <StatRow label="Loss" value={formatLoss(stats.packetLossRate)} />
          <StatRow label="State" value={stats.connectionState} />
        </dl>
      )}
    </aside>
  );
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <>
      <dt className="font-sans text-text-muted">{label}</dt>
      <dd className="text-right text-text-primary">{value}</dd>
    </>
  );
}

function formatNumber(value: number | null, digits: number): string {
  if (value === null) return '--';
  return value.toFixed(digits);
}

function formatMs(value: number | null): string {
  if (value === null) return '--';
  return `${String(value)} ms`;
}

function formatJitter(value: number | null): string {
  if (value === null) return '--';
  return `${(value * 1000).toFixed(1)} ms`;
}

function formatLoss(value: number | null): string {
  if (value === null) return '--';
  return `${(value * 100).toFixed(2)}%`;
}
