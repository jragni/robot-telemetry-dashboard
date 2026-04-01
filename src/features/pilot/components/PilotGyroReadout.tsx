import { formatDegrees } from '@/utils/formatDegrees';
import { HUD_PANEL_BASE } from '../constants';
import type { PilotGyroReadoutProps } from '../types/PilotView.types';

/** PilotGyroReadout
 * @description Renders the gyroscope orientation readout (pitch, roll, yaw)
 *  and linear speed in a compact HUD overlay panel. Uses the instrument panel
 *  typography pattern: tiny uppercase labels + bright monospace values.
 * @param pitch - Current pitch angle in degrees (null if no data).
 * @param roll - Current roll angle in degrees (null if no data).
 * @param yaw - Current yaw angle in degrees (null if no data).
 * @param linearSpeed - Current linear speed in m/s.
 */
export function PilotGyroReadout({ pitch, roll, yaw, linearSpeed }: PilotGyroReadoutProps) {
  return (
    <dl className={`${HUD_PANEL_BASE} p-3 flex flex-col gap-1`} aria-label="Gyro readout">
      <dt className="font-sans text-xs uppercase tracking-widest text-text-muted">Gyro</dt>

      <GyroRow label="PITCH" value={pitch} />
      <GyroRow label="ROLL" value={roll} />
      <GyroRow label="YAW" value={yaw} />

      <div className="border-t border-accent/10 mt-1 pt-1">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs uppercase tracking-widest text-text-muted">SPD</span>
          <span className="font-mono text-sm font-semibold text-accent tabular-nums">
            {linearSpeed.toFixed(2)}
            <span className="font-mono text-xs text-text-secondary"> m/s</span>
          </span>
        </div>
      </div>
    </dl>
  );
}

/** GyroRowProps
 * @description Props for a single gyro value row.
 */
interface GyroRowProps {
  readonly label: string;
  readonly value: number | null;
}

/** GyroRow
 * @description Renders a single row in the gyro readout with label and
 *  formatted degree value.
 * @param label - Short axis label (e.g., "PITCH").
 * @param value - Angle in degrees, or null for no data.
 */
function GyroRow({ label, value }: GyroRowProps) {
  return (
    <dd className="flex items-center justify-between">
      <span className="font-sans text-xs text-text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold text-accent tabular-nums">
        {value !== null ? formatDegrees(value) : '---'}
      </span>
    </dd>
  );
}
