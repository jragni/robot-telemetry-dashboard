import { HUD_PANEL_BASE } from '../../constants';
import type { PilotGyroReadoutProps } from '../../types/PilotPage.types';
import { GyroRow } from './GyroRow';

/** PilotGyroReadout
 * @description Renders the gyroscope orientation readout (pitch, roll, yaw)
 *  and linear speed in a compact HUD overlay panel. Uses the instrument panel
 *  typography pattern: tiny uppercase labels + bright monospace values.
 * @prop orientation - Current orientation in degrees, or null when unknown.
 */
export function PilotGyroReadout({ orientation }: PilotGyroReadoutProps) {
  return (
    <dl
      className={`${HUD_PANEL_BASE} p-2 lg:p-4 flex flex-col gap-1.5 lg:gap-2`}
      aria-label="Gyro readout"
    >
      <dt className="font-sans text-xs uppercase tracking-widest text-text-muted">Gyro</dt>

      <GyroRow label="PITCH" value={orientation?.pitch ?? null} />
      <GyroRow label="ROLL" value={orientation?.roll ?? null} />
      <GyroRow label="YAW" value={orientation?.yaw ?? null} />
    </dl>
  );
}
