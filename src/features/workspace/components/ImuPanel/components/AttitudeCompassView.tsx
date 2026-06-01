import { formatDegrees, normalizeHeading } from '@/utils';
import type { AttitudeCompassViewProps } from '@/features/workspace/types/ImuPanel.types';
import { AttitudeIndicator } from './AttitudeIndicator';
import { CompassHeading } from './CompassHeading';

/** AttitudeCompassView
 * @description Renders the default IMU visualization with attitude indicator
 *  and compass heading side by side, plus numeric readouts below.
 * @prop roll - Roll angle in degrees.
 * @prop pitch - Pitch angle in degrees.
 * @prop yaw - Yaw heading in degrees.
 */
export function AttitudeCompassView({ roll, pitch, yaw }: AttitudeCompassViewProps) {
  const heading = normalizeHeading(yaw);

  return (
    <div className="flex flex-col h-full w-full min-h-0 items-center gap-2">
      <div className="flex flex-1 min-h-0 w-full items-center justify-center gap-3">
        <div className="flex-1 h-full min-w-0 max-w-[50%]">
          <AttitudeIndicator roll={roll} pitch={pitch} />
        </div>
        <div className="flex-1 h-full min-w-0 max-w-[50%]">
          <CompassHeading yaw={yaw} />
        </div>
      </div>
      <dl className="flex gap-4 font-mono text-[clamp(0.625rem,3cqmin,0.875rem)] flex-wrap justify-center shrink-0">
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
        <div className="flex items-center gap-2">
          <dt className="font-sans text-text-secondary">HDG</dt>
          <dd className="text-text-primary font-semibold tabular-nums w-14 text-right">
            {String(Math.round(heading))}°
          </dd>
        </div>
      </dl>
    </div>
  );
}
