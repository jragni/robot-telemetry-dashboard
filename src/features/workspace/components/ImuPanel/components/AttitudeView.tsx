import { formatDegrees } from '@/utils/formatDegrees';
import type { AttitudeViewProps } from '@/features/workspace/types/ImuPanel.types';
import { AttitudeIndicator } from './AttitudeIndicator';

/** AttitudeView
 * @description Renders a larger centered attitude indicator with roll and
 *  pitch readouts below. No compass heading.
 * @prop roll - Roll angle in degrees.
 * @prop pitch - Pitch angle in degrees.
 */
export function AttitudeView({ roll, pitch }: AttitudeViewProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-40 h-40">
        <AttitudeIndicator roll={roll} pitch={pitch} />
      </div>
      <dl className="flex gap-6 font-mono text-xs">
        <div className="flex items-center gap-2">
          <dt className="font-sans text-text-secondary">ROLL</dt>
          <dd className="text-text-primary font-semibold tabular-nums w-14 text-right">
            {formatDegrees(roll)}°
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="font-sans text-text-secondary">PITCH</dt>
          <dd className="text-text-primary font-semibold tabular-nums w-14 text-right">
            {formatDegrees(pitch)}°
          </dd>
        </div>
      </dl>
    </div>
  );
}
