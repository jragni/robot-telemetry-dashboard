import { cn } from '@/lib/utils';
import { normalizeHeading } from '@/utils/normalizeHeading';
import type { ImuPanelProps } from '@/features/workspace/types/ImuPanel.types';
import { AttitudeIndicator } from './AttitudeIndicator';
import { CompassHeading } from './CompassHeading';
import { NumbersView } from './NumbersView';
import { AttitudeView } from './AttitudeView';
import { WireframeView } from './WireframeView';

/** ImuPanel
 * @description Renders the IMU attitude display in one of four visualization
 *  modes: attitude+compass, numbers only, attitude only, or 3D wireframe.
 *  Always visible — disconnected state renders at muted opacity.
 * @param roll - Roll angle in degrees.
 * @param pitch - Pitch angle in degrees.
 * @param yaw - Yaw heading in degrees.
 * @param connected - Whether the robot is currently connected.
 * @param variant - Which visualization mode to render.
 */
export function ImuPanel({ roll, pitch, yaw, connected, variant }: ImuPanelProps) {
  const headingNormalized = normalizeHeading(yaw);

  function renderVariant() {
    switch (variant) {
      case 'attitude-compass':
        return (
          <>
            <div className="flex items-center gap-3">
              <AttitudeIndicator roll={roll} pitch={pitch} />
              <CompassHeading yaw={yaw} />
            </div>
            <dl className="flex gap-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <dt className="font-sans text-text-muted">ROLL</dt>
                <dd className="text-accent font-semibold tabular-nums w-14 text-right">
                  {String(Math.round(roll * 10) / 10)}°
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="font-sans text-text-muted">PITCH</dt>
                <dd className="text-accent font-semibold tabular-nums w-14 text-right">
                  {String(Math.round(pitch * 10) / 10)}°
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="font-sans text-text-muted">HDG</dt>
                <dd className="text-accent font-semibold tabular-nums w-14 text-right">
                  {String(Math.round(headingNormalized))}°
                </dd>
              </div>
            </dl>
          </>
        );
      case 'numbers':
        return <NumbersView roll={roll} pitch={pitch} yaw={yaw} />;
      case 'attitude':
        return <AttitudeView roll={roll} pitch={pitch} />;
      case '3d':
        return <WireframeView roll={roll} pitch={pitch} yaw={yaw} />;
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', !connected && 'opacity-50')}>
      {renderVariant()}
    </div>
  );
}
