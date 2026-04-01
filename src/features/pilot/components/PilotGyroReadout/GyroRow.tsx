import { formatDegrees } from '@/utils/formatDegrees';
import type { GyroRowProps } from '../../types/PilotGyroReadout.types';

/** GyroRow
 * @description Renders a single row in the gyro readout with label and
 *  formatted degree value.
 * @param label - Short axis label (e.g., "PITCH").
 * @param value - Angle in degrees, or null for no data.
 */
export function GyroRow({ label, value }: GyroRowProps) {
  return (
    <dd className="flex items-center justify-between gap-4">
      <span className="font-sans text-xs text-text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold text-accent tabular-nums min-w-12 text-right">
        {value !== null ? formatDegrees(value) : '---'}
      </span>
    </dd>
  );
}
