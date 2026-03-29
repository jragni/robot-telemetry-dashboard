import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RobotCardProps } from './RobotCard.types';
import { RobotStatusBadge } from './RobotStatusBadge';
import { RobotDeleteButton } from './RobotDeleteButton';
import { ROBOT_COLOR_BORDER, ROBOT_COLOR_TEXT } from './RobotCard.constants';
import { formatLastSeen } from '../fleet.helpers';

export function RobotCard({ robot, onRemove }: RobotCardProps) {
  const navigate = useNavigate();
  const borderColor = ROBOT_COLOR_BORDER[robot.color];
  const iconColor = ROBOT_COLOR_TEXT[robot.color];

  return (
    <div
      className={`bg-surface-primary border border-border border-l-3 ${borderColor} rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)] p-4 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className={iconColor} />
          <span className="font-sans text-sm font-semibold text-text-primary">
            {robot.name}
          </span>
        </div>
        <RobotStatusBadge status={robot.status} />
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <span className="font-sans text-xs text-text-muted">Last seen</span>
          <span className="font-mono text-xs text-accent">
            {formatLastSeen(robot.lastSeen)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="font-sans text-xs text-text-muted">URL</span>
          <span className="font-mono text-xs text-text-secondary truncate max-w-45">
            {robot.url}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void navigate(`/robot/${robot.id}`);
          }}
          className="text-xs uppercase tracking-widest text-accent border-accent hover:bg-accent-subtle"
        >
          View
        </Button>
        <RobotDeleteButton
          robotName={robot.name}
          onRemove={() => {
            onRemove(robot.id);
          }}
        />
      </div>
    </div>
  );
}
