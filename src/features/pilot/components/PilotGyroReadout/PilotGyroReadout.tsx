import { HUD_PANEL_BASE } from '../../constants';
import type { PilotGyroReadoutProps } from '../../types/PilotView.types';
import { GyroRow } from './GyroRow';

/** PilotGyroReadout
 * @description Renders the gyroscope orientation readout (pitch, roll, yaw)
 *  and linear speed in a compact HUD overlay panel. Uses the instrument panel
 *  typography pattern: tiny uppercase labels + bright monospace values.
 * @prop pitch - Current pitch angle in degrees (null if no data).
 * @prop roll - Current roll angle in degrees (null if no data).
 * @prop yaw - Current yaw angle in degrees (null if no data).
 */
export function PilotGyroReadout({ pitch, roll, yaw }: PilotGyroReadoutProps) {
  return (
    <dl
      className={`${HUD_PANEL_BASE} p-2 lg:p-4 flex flex-col gap-1.5 lg:gap-2`}
      aria-label="Gyro readout"
    >
      <dt className="font-sans text-xs uppercase tracking-widest text-text-muted">Gyro</dt>

      <GyroRow label="PITCH" value={pitch} />
      <GyroRow label="ROLL" value={roll} />
      <GyroRow label="YAW" value={yaw} />
    </dl>
  );
}
