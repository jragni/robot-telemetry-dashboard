import { formatDegrees } from '@/utils/formatDegrees';
import { normalizeHeading } from '@/utils/normalizeHeading';
import type { AttitudeCompassViewProps } from '@/features/workspace/types/ImuPanel.types';
import { AttitudeIndicator } from './AttitudeIndicator';
import { CompassHeading } from './CompassHeading';

/** AttitudeCompassView
 * @description Renders the default IMU visualization with attitude indicator
 *  and compass heading side by side, plus numeric readouts below.
 * @param roll - Roll angle in degrees.
 * @param pitch - Pitch angle in degrees.
 * @param yaw - Yaw heading in degrees.
 */
export function AttitudeCompassView({ roll, pitch, yaw }: AttitudeCompassViewProps) {
  const heading = normalizeHeading(yaw);

  return (
    <>
      <div className="flex items-center gap-3">
        <AttitudeIndicator roll={roll} pitch={pitch} />
        <CompassHeading yaw={yaw} />
      </div>
      <dl className="flex gap-4 font-mono text-xs">
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
