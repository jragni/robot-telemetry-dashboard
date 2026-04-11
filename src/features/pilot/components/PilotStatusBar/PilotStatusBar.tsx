import { HUD_PANEL_BASE } from '../../constants';
import type { PilotStatusBarProps } from '../../types/PilotPage.types';
import { BatteryRow } from './BatteryRow';
import { ConnectionRow } from './ConnectionRow';

/** PilotStatusBar
 * @description Renders the battery, dual connection status, and uptime
 *  indicators in a compact HUD overlay panel. Shows independent status for
 *  rosbridge (controls/telemetry) and video (WebRTC) connections.
 * @prop battery - Battery state with percentage and voltage, or null.
 * @prop rosbridgeStatus - Rosbridge WebSocket connection state.
 * @prop videoStatus - WebRTC video stream connection state.
 */
export function PilotStatusBar({ battery, rosbridgeStatus, videoStatus }: PilotStatusBarProps) {
  const videoConnected = videoStatus === 'streaming';

  return (
    <section
      className={`${HUD_PANEL_BASE} p-2 lg:p-4 flex flex-col gap-1.5 lg:gap-2`}
      aria-label="System status"
    >
      <BatteryRow percentage={battery?.percentage ?? null} />

      <div className="border-t border-accent/10 pt-2 flex flex-col gap-1.5">
        <ConnectionRow label="ROS" connected={rosbridgeStatus === 'connected'} />
        <ConnectionRow label="VIDEO" connected={videoConnected} />
      </div>
    </section>
  );
}
