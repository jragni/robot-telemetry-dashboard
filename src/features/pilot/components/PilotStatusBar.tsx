import { formatUptime } from '@/utils/formatUptime';
import { HUD_PANEL_BASE, BATTERY_THRESHOLDS } from '../constants';
import type { PilotStatusBarProps } from '../types/PilotView.types';

/** PilotStatusBar
 * @description Renders the battery, dual connection status, and uptime
 *  indicators in a compact HUD overlay panel. Shows independent status for
 *  rosbridge (controls/telemetry) and video (WebRTC) connections.
 * @param battery - Battery state with percentage and voltage, or null.
 * @param rosbridgeStatus - Rosbridge WebSocket connection state.
 * @param videoStatus - WebRTC video stream connection state.
 * @param uptimeSeconds - Robot uptime in seconds, or null.
 */
export function PilotStatusBar({
  battery,
  rosbridgeStatus,
  videoStatus,
  uptimeSeconds,
}: PilotStatusBarProps) {
  const batteryColor = getBatteryColor(battery?.percentage ?? null);
  const videoConnected = videoStatus === 'streaming';

  return (
    <dl className={`${HUD_PANEL_BASE} p-3 flex flex-col gap-1.5`} aria-label="System status">
      <BatteryRow percentage={battery?.percentage ?? null} color={batteryColor} />

      <div className="border-t border-accent/10 pt-1.5 flex flex-col gap-1">
        <ConnectionRow
          label="ROSBRIDGE"
          connected={rosbridgeStatus === 'connected'}
        />
        <ConnectionRow
          label="VIDEO"
          connected={videoConnected}
        />
      </div>

      <div className="border-t border-accent/10 pt-1.5">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs uppercase tracking-widest text-text-muted">UP</span>
          <span className="font-mono text-xs text-text-secondary tabular-nums">
            {uptimeSeconds !== null ? formatUptime(uptimeSeconds) : '--:--'}
          </span>
        </div>
      </div>
    </dl>
  );
}

/** getBatteryColor
 * @description Returns the appropriate status color class for a battery percentage.
 */
function getBatteryColor(percentage: number | null): string {
  if (percentage === null) return 'text-text-muted';
  if (percentage <= BATTERY_THRESHOLDS.critical) return 'text-status-critical';
  if (percentage <= BATTERY_THRESHOLDS.caution) return 'text-status-caution';
  return 'text-status-nominal';
}

/** BatteryRowProps
 * @description Props for the battery display row.
 */
interface BatteryRowProps {
  readonly percentage: number | null;
  readonly color: string;
}

/** BatteryRow
 * @description Renders the battery percentage with a small bar indicator.
 */
function BatteryRow({ percentage, color }: BatteryRowProps) {
  const pct = percentage ?? 0;
  const barWidth = percentage !== null ? `${String(Math.max(pct, 5))}%` : '0%';

  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-xs uppercase tracking-widest text-text-muted">BAT</span>
      <div className="flex items-center gap-2">
        <div className="w-8 h-2 rounded-sm bg-surface-tertiary overflow-hidden">
          <div className={`h-full ${color} bg-current`} style={{ width: barWidth }} />
        </div>
        <span className={`font-mono text-sm font-semibold tabular-nums ${color}`}>
          {percentage !== null ? `${String(pct)}%` : '--'}
        </span>
      </div>
    </div>
  );
}

/** ConnectionRowProps
 * @description Props for a single connection status row.
 */
interface ConnectionRowProps {
  readonly label: string;
  readonly connected: boolean;
}

/** ConnectionRow
 * @description Renders a connection status row with animated dot indicator
 *  and label. Uses breathe-pulse animation when connected.
 */
function ConnectionRow({ label, connected }: ConnectionRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-xs text-text-muted">{label}</span>
      <div className="flex items-center gap-1.5">
        <span
          className={`size-1.5 rounded-full ${
            connected
              ? 'bg-status-nominal motion-safe:animate-pulse'
              : 'bg-status-critical'
          }`}
          aria-hidden="true"
        />
        <span className={`font-mono text-xs ${connected ? 'text-status-nominal' : 'text-status-critical'}`}>
          {connected ? 'OK' : 'OFF'}
        </span>
      </div>
    </div>
  );
}
