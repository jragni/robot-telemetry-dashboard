import { getBatteryColor } from '@/utils';
import type { BatteryRowProps } from './PilotStatusBar.types';

/** BatteryRow
 * @description Renders the battery percentage with a small bar indicator.
 *  Derives color from percentage using battery threshold constants.
 * @prop percentage - Battery percentage value (0-100), or null if unknown.
 */
export function BatteryRow({ percentage }: BatteryRowProps) {
  const color = getBatteryColor(percentage);
  const pct = percentage ?? 0;
  const barWidth = percentage !== null ? `${String(Math.max(pct, 5))}%` : '0%';

  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-xs uppercase tracking-widest text-text-muted">BAT</span>
      <div className="flex items-center gap-2">
        <div className="w-8 h-2 rounded-sm bg-surface-tertiary overflow-hidden">
          <div className={`h-full ${color} bg-current`} style={{ width: barWidth }} />
        </div>
        <span className={`font-mono text-sm font-semibold tabular-nums ${color}`}>
          {percentage !== null ? `${String(Math.round(pct))}%` : '--'}
        </span>
      </div>
    </div>
  );
}
