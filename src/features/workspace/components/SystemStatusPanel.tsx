import { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, PlugZap, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatLastSeen } from '@/utils/formatLastSeen';
import { formatUptime } from '@/utils/formatUptime';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { SystemStatusPanelProps } from '@/features/workspace/types/SystemStatusPanel.types';
import { StatusRow } from './StatusRow';

/** ExpandableRow
 * @description A status row that expands to show a list of names when clicked.
 */
function ExpandableRow({ label, count, names }: {
  readonly label: string;
  readonly count: number;
  readonly names: readonly string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const hasNames = names.length > 0;
  const Chevron = expanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <button
        type="button"
        onClick={() => { if (hasNames) setExpanded((v) => !v); }}
        className="flex items-center justify-between w-full text-left cursor-pointer hover:bg-surface-tertiary/50 rounded-sm px-1 -mx-1 transition"
        aria-expanded={expanded}
        disabled={!hasNames}
      >
        <span className="font-sans text-xs text-text-secondary uppercase tracking-wide">{label}</span>
        <span className="flex items-center gap-1 text-text-primary tabular-nums">
          {String(count)}
          <ConditionalRender
            shouldRender={hasNames}
            Component={<Chevron className="size-3 text-text-muted" />}
          />
        </span>
      </button>
      <ConditionalRender
        shouldRender={expanded}
        Component={
          <ul className="ml-3 mt-1 mb-1 flex flex-col gap-0.5 max-h-24 overflow-y-auto border-l border-border pl-2">
            {names.map((name) => (
              <li key={name} className="font-mono text-xs text-text-muted truncate">{name}</li>
            ))}
          </ul>
        }
      />
    </div>
  );
}

/** SystemStatusPanel
 * @description Renders robot system status including connection state, uptime,
 *  battery, ROS computation graph with expandable name lists, and a
 *  reconnect/disconnect button.
 */
export function SystemStatusPanel({
  name,
  url,
  connected,
  status,
  lastSeen,
  uptimeSeconds,
  battery,
  rosGraph,
  onConnect,
  onDisconnect,
}: SystemStatusPanelProps) {
  const isConnecting = status === 'connecting';

  return (
    <dl className="flex flex-col gap-2 font-mono text-xs w-full h-full px-2 pt-1 overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs font-semibold text-text-primary">{name}</span>
        <div className="flex items-center gap-1.5" aria-live="polite">
          <span
            className={`size-2 rounded-full ${connected ? 'bg-status-nominal motion-safe:animate-pulse' : 'bg-status-critical'}`}
            aria-hidden="true"
          />
          <span className={connected ? 'text-status-nominal' : 'text-status-offline'}>
            {connected ? 'CONNECTED' : isConnecting ? 'CONNECTING' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <span className="font-mono text-xs text-text-muted truncate">{url}</span>

      <ConditionalRender
        shouldRender={!!(onConnect ?? onDisconnect)}
        Component={
          <Button
            variant="outline"
            size="sm"
            disabled={isConnecting}
            onClick={connected ? onDisconnect : onConnect}
            className="w-full font-sans text-xs uppercase tracking-widest cursor-pointer transition"
            aria-label={connected ? 'Disconnect from robot' : 'Connect to robot'}
          >
            {isConnecting ? (
              <><Loader2 size={12} className="animate-spin" /> Connecting</>
            ) : connected ? (
              <><Unplug size={12} /> Disconnect</>
            ) : (
              <><PlugZap size={12} /> Connect</>
            )}
          </Button>
        }
      />

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

      <ExpandableRow label="NODES" count={rosGraph?.nodes ?? 0} names={rosGraph?.nodeNames ?? []} />
      <ExpandableRow label="TOPICS" count={rosGraph?.topics ?? 0} names={rosGraph?.topicNames ?? []} />
      <ExpandableRow label="SERVICES" count={rosGraph?.services ?? 0} names={rosGraph?.serviceNames ?? []} />
      <ExpandableRow label="ACTIONS" count={rosGraph?.actions ?? 0} names={rosGraph?.actionNames ?? []} />
    </dl>
  );
}
