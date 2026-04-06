import { useState } from 'react';
import { Loader2, PlugZap, Unplug } from 'lucide-react';

import { useBatterySubscription, useConnectionUptime, useRosGraph, useRosTopics } from '@/hooks';
import { Button } from '@/components/ui/button';
import { formatLastSeen } from '@/utils/formatLastSeen';
import { formatUptime } from '@/utils/formatUptime';
import { getBatteryColor } from '@/utils/getBatteryColor';

import { ExpandableRow } from './ExpandableRow';
import { StatusRow } from './StatusRow';
import type { SystemStatusPanelProps } from './SystemStatusPanel.types';

/** SystemStatusPanel
 * @description Renders robot system status including connection state, uptime,
 *  battery, ROS computation graph with expandable name lists, and a
 *  reconnect/disconnect button. Owns its own ROS subscriptions for battery,
 *  uptime, topic discovery, and graph polling.
 * @prop ros - Active roslib connection, or undefined when disconnected.
 * @prop connected - Whether the robot is currently connected.
 * @prop robot - Full robot connection record from the connection store.
 * @prop onConnect - Optional callback to initiate a connection.
 * @prop onDisconnect - Optional callback to disconnect the robot.
 */
export function SystemStatusPanel({
  connected,
  onConnect,
  onDisconnect,
  robot,
  ros,
}: SystemStatusPanelProps) {
  const { lastSeen, name, status, url } = robot;

  const availableTopics = useRosTopics(ros);
  const battery = useBatterySubscription(ros, availableTopics);
  const rosGraph = useRosGraph(ros);
  const uptimeSeconds = useConnectionUptime(robot.id, connected);

  const isConnecting = status === 'connecting';
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  function toggleSection(section: string) {
    setExpandedSection((prev) => (prev === section ? null : section));
  }

  return (
    <dl className="flex flex-col gap-2 font-mono text-xs w-full h-full px-2 pt-1 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs font-semibold text-text-primary">{name}</span>
        <div className="flex items-center gap-1.5" aria-live="polite">
          <span
            className={`size-2 rounded-full ${
              connected
                ? 'bg-status-nominal motion-safe:animate-pulse'
                : isConnecting
                  ? 'bg-status-caution motion-safe:animate-pulse'
                  : 'bg-status-critical'
            }`}
            aria-hidden="true"
          />
          <span
            className={`font-mono text-xs ${connected ? 'text-status-nominal' : 'text-status-offline'}`}
          >
            {connected ? 'NOMINAL' : isConnecting ? 'CAUTION' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <span className="font-mono text-xs text-text-muted truncate">{url}</span>

      {!!(onConnect ?? onDisconnect) && (
        <Button
          variant="outline"
          size="sm"
          disabled={isConnecting}
          onClick={connected ? onDisconnect : onConnect}
          className="w-full font-sans text-xs uppercase tracking-widest cursor-pointer transition"
          aria-label={connected ? 'Disconnect from robot' : 'Connect to robot'}
        >
          {isConnecting ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Connecting
            </>
          ) : connected ? (
            <>
              <Unplug size={12} /> Disconnect
            </>
          ) : (
            <>
              <PlugZap size={12} /> Connect
            </>
          )}
        </Button>
      )}

      <hr className="border-border border-dashed my-1" />

      {connected && (
        <>
          <StatusRow label="UPTIME" value={formatUptime(uptimeSeconds)} />
          <StatusRow
            label="BATTERY"
            value={battery ? `${String(Math.round(battery.percentage))}%` : '—'}
            valueClass={getBatteryColor(battery?.percentage ?? null)}
          />
        </>
      )}

      <StatusRow label="LAST SEEN" value={formatLastSeen(lastSeen)} />

      <hr className="border-border border-dashed my-1" />

      <ExpandableRow
        label="NODES"
        count={rosGraph?.nodes ?? 0}
        names={rosGraph?.nodeNames ?? []}
        expanded={expandedSection === 'nodes'}
        onToggle={() => {
          toggleSection('nodes');
        }}
      />
      <ExpandableRow
        label="TOPICS"
        count={rosGraph?.topics ?? 0}
        names={rosGraph?.topicNames ?? []}
        expanded={expandedSection === 'topics'}
        onToggle={() => {
          toggleSection('topics');
        }}
      />
      <ExpandableRow
        label="SERVICES"
        count={rosGraph?.services ?? 0}
        names={rosGraph?.serviceNames ?? []}
        expanded={expandedSection === 'services'}
        onToggle={() => {
          toggleSection('services');
        }}
      />
      <ExpandableRow
        label="ACTIONS"
        count={rosGraph?.actions ?? 0}
        names={rosGraph?.actionNames ?? []}
        expanded={expandedSection === 'actions'}
        onToggle={() => {
          toggleSection('actions');
        }}
      />
    </dl>
  );
}
