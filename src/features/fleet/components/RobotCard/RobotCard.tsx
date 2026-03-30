import { Link } from 'react-router-dom';
import { Bot, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatLastSeen } from '@/utils/formatLastSeen';
import type { RobotCardProps } from '../../types/RobotCard.types';
import { RobotStatusBadge } from './RobotStatusBadge';
import { RobotDeleteButton } from './RobotDeleteButton';
import { ROBOT_COLOR_BORDER, ROBOT_COLOR_TEXT } from './RobotCard.constants';

/**
 * Displays a single robot's connection info, system diagnostics, and navigation actions.
 * Shows full status details matching the workspace System Status panel layout.
 * Pilot button is always accessible even when disconnected.
 */
export function RobotCard({ robot, onRemove }: RobotCardProps) {
  const borderColor = ROBOT_COLOR_BORDER[robot.color];
  const iconColor = ROBOT_COLOR_TEXT[robot.color];
  const isConnected = robot.status === 'connected';

  return (
    <article
      className={`bg-surface-primary border border-border border-l-4 ${borderColor} rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)] p-4 flex flex-col gap-3`}
    >
      {/* Identity */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className={iconColor} />
          <h3 className="font-sans text-xl font-semibold text-text-primary">
            {robot.name}
          </h3>
        </div>
        <RobotStatusBadge status={robot.status} />
      </header>

      <hr className="border-border" />

      {/* Connection info */}
      <dl className="flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <dt className="font-sans text-xs text-text-muted">URL</dt>
          <dd className="font-mono text-xs text-text-secondary truncate max-w-45">
            {robot.url}
          </dd>
        </div>
        <div className="flex justify-between items-baseline">
          <dt className="font-sans text-xs text-text-muted">Last seen</dt>
          <dd className="font-mono text-xs text-accent tabular-nums">
            {formatLastSeen(robot.lastSeen)}
          </dd>
        </div>
      </dl>

      <hr className="border-border border-dashed" />

      {/* Vitals (only when connected) */}
      {isConnected && (
        <>
          <dl className="flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline">
              <dt className="font-sans text-xs text-text-muted">Uptime</dt>
              <dd className="font-mono text-xs text-text-primary tabular-nums">
                —
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="font-sans text-xs text-text-muted">Battery</dt>
              <dd className="font-mono text-xs text-status-nominal tabular-nums">
                —
              </dd>
            </div>
          </dl>

          <hr className="border-border border-dashed" />
        </>
      )}

      {/* Computation graph */}
      <dl className="flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <dt className="font-sans text-xs text-text-muted">Nodes</dt>
          <dd className="font-mono text-xs text-text-primary tabular-nums">
            {isConnected ? '—' : '—'}
          </dd>
        </div>
        <div className="flex justify-between items-baseline">
          <dt className="font-sans text-xs text-text-muted">Topics</dt>
          <dd className="font-mono text-xs text-text-primary tabular-nums">
            {isConnected ? '—' : '—'}
          </dd>
        </div>
        <div className="flex justify-between items-baseline">
          <dt className="font-sans text-xs text-text-muted">Services</dt>
          <dd className="font-mono text-xs text-text-primary tabular-nums">
            {isConnected ? '—' : '—'}
          </dd>
        </div>
        <div className="flex justify-between items-baseline">
          <dt className="font-sans text-xs text-text-muted">Actions</dt>
          <dd className="font-mono text-xs text-text-primary tabular-nums">
            {isConnected ? '—' : '—'}
          </dd>
        </div>
      </dl>

      {/* Actions */}
      <footer className="flex items-center gap-2 mt-1">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="font-sans text-xs uppercase tracking-widest text-accent border-accent hover:bg-accent-subtle"
        >
          <Link to={`/robot/${robot.id}`}>View</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="font-sans text-xs uppercase tracking-widest text-text-secondary border-border hover:text-accent hover:border-accent"
        >
          <Link to={`/pilot/${robot.id}`}>
            <Crosshair size={12} />
            Pilot
          </Link>
        </Button>
        <div className="ml-auto">
          <RobotDeleteButton
            robotName={robot.name}
            onRemove={() => {
              onRemove(robot.id);
            }}
          />
        </div>
      </footer>
    </article>
  );
}
