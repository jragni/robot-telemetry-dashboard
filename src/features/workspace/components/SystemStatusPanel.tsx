import { formatLastSeen } from '@/utils/formatLastSeen';
import { formatUptime } from '@/utils/formatUptime';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { SystemStatusPanelProps } from '@/features/workspace/types/SystemStatusPanel.types';
import { StatusRow } from './StatusRow';

/** SystemStatusPanel
 * @description Renders robot system status including connection state, uptime,
 *  battery, and ROS computation graph counts. Always visible — shows dashes
 *  for unavailable values when disconnected.
 * @param name - Robot display name.
 * @param url - Rosbridge WebSocket URL.
 * @param connected - Whether the robot is currently connected.
 * @param lastSeen - Timestamp of last rosbridge message, or null.
 * @param uptimeSeconds - Robot uptime in seconds, or null.
 * @param battery - Battery telemetry, or null.
 * @param rosGraph - ROS computation graph counts, or null.
 */
export function SystemStatusPanel({
  name,
  url,
  connected,
  lastSeen,
  uptimeSeconds,
  battery,
  rosGraph,
}: SystemStatusPanelProps) {
  return (
    <dl className="flex flex-col gap-2 font-mono text-xs w-full px-2 self-start pt-1">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs font-semibold text-text-primary">{name}</span>
        <div className="flex items-center gap-1.5" aria-live="polite">
          <span
            className={`size-2 rounded-full ${connected ? 'bg-status-nominal motion-safe:animate-pulse' : 'bg-status-critical'}`}
            aria-hidden="true"
          />
          <span className={connected ? 'text-status-nominal' : 'text-status-offline'}>
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <span className="font-mono text-xs text-text-muted truncate">{url}</span>

      <div className="border-t border-border border-dashed my-1" />

      <ConditionalRender
        shouldRender={connected}
        Component={
          <>
            <StatusRow label="UPTIME" value={formatUptime(uptimeSeconds)} />
            <StatusRow
              label="BATTERY"
              value={battery ? `${String(Math.round(battery.percentage))}%` : '—'}
              valueClass={
                battery && battery.percentage > 50
                  ? 'text-status-nominal'
                  : battery && battery.percentage > 20
                    ? 'text-status-caution'
                    : battery
                      ? 'text-status-critical'
                      : undefined
              }
            />
          </>
        }
      />

      <StatusRow label="LAST SEEN" value={formatLastSeen(lastSeen)} />

      <div className="border-t border-border border-dashed my-1" />

      <StatusRow label="NODES" value={rosGraph ? String(rosGraph.nodes) : '—'} />
      <StatusRow label="TOPICS" value={rosGraph ? String(rosGraph.topics) : '—'} />
      <StatusRow label="SERVICES" value={rosGraph ? String(rosGraph.services) : '—'} />
      <StatusRow label="ACTIONS" value={rosGraph ? String(rosGraph.actions) : '—'} />
    </dl>
  );
}
