import { formatDegrees } from '@/utils/formatDegrees';
import { normalizeHeading } from '@/utils/normalizeHeading';
import type { NumbersViewProps } from '@/features/workspace/types/ImuPanel.types';

/** NumbersView
 * @description Renders flight-data-recorder style numeric readouts for
 *  roll, pitch, and heading. Large monospace values, vertically stacked.
 * @prop roll - Roll angle in degrees.
 * @prop pitch - Pitch angle in degrees.
 * @prop yaw - Yaw heading in degrees.
 */
export function NumbersView({ roll, pitch, yaw }: NumbersViewProps) {
  const heading = normalizeHeading(yaw);

  return (
    <dl className="flex flex-col gap-4 w-full px-4">
      <div className="flex items-baseline justify-between">
        <dt className="font-sans text-xs text-text-secondary">ROLL</dt>
        <dd className="font-mono text-xl tabular-nums text-text-primary">{formatDegrees(roll)}°</dd>
      </div>
      <div className="border-t border-border border-dashed" />
      <div className="flex items-baseline justify-between">
        <dt className="font-sans text-xs text-text-secondary">PITCH</dt>
        <dd className="font-mono text-xl tabular-nums text-text-primary">
          {formatDegrees(pitch)}°
        </dd>
      </div>
      <div className="border-t border-border border-dashed" />
      <div className="flex items-baseline justify-between">
        <dt className="font-sans text-xs text-text-secondary">HDG</dt>
        <dd className="font-mono text-xl tabular-nums text-text-primary">
          {String(Math.round(heading))}°
        </dd>
      </div>
    </dl>
  );
}
