import { formatLastSeen } from '@/utils/formatLastSeen';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { MockSystemStatusProps } from '@/features/workspace/types/MockSystemStatus.types';

/** MockSystemStatus
 * @description Renders mock system status showing connection state, vitals,
 *  and ROS computation graph counts.
 * @param name - Robot display name.
 * @param url - Rosbridge WebSocket URL.
 * @param lastSeen - Timestamp of last rosbridge message, or null.
 * @param connected - Whether the robot is currently connected.
 */
export function MockSystemStatus({
  name,
  url,
  lastSeen,
  connected = true,
}: MockSystemStatusProps) {
  return (
    <div className="flex flex-col gap-2 font-mono text-xs w-full px-2 self-start pt-1">
      <div className="flex items-center justify-between">
        <span className="text-text-primary font-semibold">{name}</span>
        <div className="flex items-center gap-1.5">
          <span
            className={`size-2 rounded-full ${connected ? 'bg-status-nominal animate-pulse' : 'bg-status-offline'}`}
          />
          <span
            className={
              connected ? 'text-status-nominal' : 'text-status-offline'
            }
          >
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
      <span className="text-text-muted truncate">{url}</span>
      <div className="border-t border-border border-dashed my-1" />
      <ConditionalRender
        shouldRender={connected}
        Component={
          <>
            <div className="flex justify-between">
              <span className="text-text-muted">UPTIME</span>
              <span className="text-text-primary tabular-nums">02:14:38</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">BATTERY</span>
              <span className="text-status-nominal tabular-nums">87%</span>
            </div>
          </>
        }
      />
      <div className="flex justify-between">
        <span className="text-text-muted">LAST SEEN</span>
        <span className="text-text-primary tabular-nums">
          {formatLastSeen(lastSeen)}
        </span>
      </div>
      <div className="border-t border-border border-dashed my-1" />
      <div className="flex justify-between">
        <span className="text-text-muted">NODES</span>
        <span className="text-text-primary tabular-nums">
          {connected ? '12' : '—'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-text-muted">TOPICS</span>
        <span className="text-text-primary tabular-nums">
          {connected ? '34' : '—'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-text-muted">SERVICES</span>
        <span className="text-text-primary tabular-nums">
          {connected ? '18' : '—'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-text-muted">ACTIONS</span>
        <span className="text-text-primary tabular-nums">
          {connected ? '3' : '—'}
        </span>
      </div>
    </div>
  );
}
