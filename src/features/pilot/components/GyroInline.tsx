import { formatDegrees } from '@/utils/formatDegrees';

import type { GyroInlineProps } from '../types/PilotView.types';

/** GyroInline
 * @description Renders R P Y values in a compact inline row.
 *  Used in the mobile HUD status bar for at-a-glance orientation data.
 */
export function GyroInline({ pitch, roll, yaw }: GyroInlineProps) {
  const fmt = (v: number | null) => (v !== null ? formatDegrees(v) : '---');

  return (
    <div className="flex items-center gap-2" aria-label="Gyro readout">
      <span className="font-mono text-xs text-text-muted">
        R:<span className="text-text-primary tabular-nums">{fmt(roll)}</span>
      </span>
      <span className="font-mono text-xs text-text-muted">
        P:<span className="text-text-primary tabular-nums">{fmt(pitch)}</span>
      </span>
      <span className="font-mono text-xs text-text-muted">
        Y:<span className="text-text-primary tabular-nums">{fmt(yaw)}</span>
      </span>
    </div>
  );
}
