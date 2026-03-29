import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import type { RobotCardProps } from './RobotCard.types';
import { RobotStatusBadge } from './RobotStatusBadge';
import { RobotDeleteButton } from './RobotDeleteButton';

export function RobotCard({ robot, onRemove }: RobotCardProps) {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        void navigate(`/robot/${robot.id}`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') void navigate(`/robot/${robot.id}`);
      }}
      className="group bg-surface-primary border border-border rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)] p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:border-border-hover hover:shadow-[inset_0_1px_0_0_var(--color-surface-glow),0_0_20px_var(--color-accent-glow)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 relative"
    >
      <RobotDeleteButton
        robotName={robot.name}
        onRemove={() => {
          onRemove(robot.id);
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-text-secondary" />
          <span className="font-sans text-sm font-semibold text-text-primary">
            {robot.name}
          </span>
        </div>
        <RobotStatusBadge status={robot.status} />
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <span className="font-sans text-xs text-text-muted">Latency</span>
          <span className="font-mono text-xs text-accent">
            {robot.latencyMs != null ? `${String(robot.latencyMs)}ms` : '—'}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="font-sans text-xs text-text-muted">URL</span>
          <span className="font-mono text-xs text-text-secondary truncate max-w-[180px]">
            {robot.url}
          </span>
        </div>
      </div>
    </div>
  );
}
