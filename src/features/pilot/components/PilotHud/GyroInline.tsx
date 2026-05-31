import { formatDegrees } from '@/utils';

import type { GyroInlineProps } from '../../types/PilotPage.types';

/** GyroInline
 * @description Renders R P Y values in a compact inline row.
 *  Used in the mobile HUD status bar for at-a-glance orientation data.
 */
export function GyroInline({ orientation }: GyroInlineProps) {
  const fmt = (v: number | null | undefined) => (v != null ? formatDegrees(v) : '---');

  return (
    <div className="flex items-center gap-2" aria-label="Gyro readout">
      <span className="font-mono text-xs text-text-muted">
        R:<span className="text-text-primary tabular-nums">{fmt(orientation?.roll)}</span>
      </span>
      <span className="font-mono text-xs text-text-muted">
        P:<span className="text-text-primary tabular-nums">{fmt(orientation?.pitch)}</span>
      </span>
      <span className="font-mono text-xs text-text-muted">
        Y:<span className="text-text-primary tabular-nums">{fmt(orientation?.yaw)}</span>
      </span>
    </div>
  );
}
