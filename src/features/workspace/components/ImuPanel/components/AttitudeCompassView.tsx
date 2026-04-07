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
    <>
      <div className="flex items-center gap-3 shrink-0 max-w-full">
        <AttitudeIndicator roll={roll} pitch={pitch} />
        <CompassHeading yaw={yaw} />
      </div>
      <dl className="flex gap-4 font-mono text-xs flex-wrap justify-center">
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
    </>
  );
}
