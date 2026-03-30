import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatLastSeen } from '@/utils/formatLastSeen';
import type { RobotCardProps } from '../../types/RobotCard.types';
import { RobotStatusBadge } from './RobotStatusBadge';
import { RobotDeleteButton } from './RobotDeleteButton';
import { ROBOT_COLOR_BORDER, ROBOT_COLOR_TEXT } from './RobotCard.constants';

/**
 * Displays a single robot's connection info with status, actions, and navigation.
 * @param props.robot - The robot connection data to display.
 * @param props.onRemove - Callback invoked with the robot ID when the user confirms removal.
 */
export function RobotCard({ robot, onRemove }: RobotCardProps) {
  const borderColor = ROBOT_COLOR_BORDER[robot.color];
  const iconColor = ROBOT_COLOR_TEXT[robot.color];

  return (
    <article
      className={`bg-surface-primary border border-border border-l-4 ${borderColor} rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)] p-4 flex flex-col gap-3`}
    >
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

      <dl className="flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <dt className="font-sans text-xs text-text-muted">Last seen</dt>
          <dd className="font-mono text-xs text-accent">
            {formatLastSeen(robot.lastSeen)}
          </dd>
        </div>
        <div className="flex justify-between items-baseline">
          <dt className="font-sans text-xs text-text-muted">URL</dt>
          <dd className="font-mono text-xs text-text-secondary truncate max-w-45">
            {robot.url}
          </dd>
        </div>
      </dl>

      <footer className="flex items-center justify-between mt-1">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="font-sans text-xs uppercase tracking-widest text-accent border-accent hover:bg-accent-subtle"
        >
          <Link to={`/robot/${robot.id}`}>View</Link>
        </Button>
        <RobotDeleteButton
          robotName={robot.name}
          onRemove={() => {
            onRemove(robot.id);
          }}
        />
      </footer>
    </article>
  );
}
