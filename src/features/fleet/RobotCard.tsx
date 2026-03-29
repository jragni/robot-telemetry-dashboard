import { useNavigate } from 'react-router-dom';
import {
  Bot,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Trash2,
} from 'lucide-react';
import type {
  RobotConnection,
  ConnectionStatus,
} from '../../shared/stores/connection/useConnectionStore.types';

interface RobotCardProps {
  readonly robot: RobotConnection;
  readonly onRemove: (id: string) => void;
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; color: string; bg: string; Icon: typeof CheckCircle }
> = {
  nominal: {
    label: 'Nominal',
    color: 'text-status-nominal',
    bg: 'bg-status-nominal-bg',
    Icon: CheckCircle,
  },
  caution: {
    label: 'Caution',
    color: 'text-status-caution',
    bg: 'bg-status-caution-bg',
    Icon: AlertTriangle,
  },
  critical: {
    label: 'Critical',
    color: 'text-status-critical',
    bg: 'bg-status-critical-bg',
    Icon: XCircle,
  },
  offline: {
    label: 'Offline',
    color: 'text-status-offline',
    bg: 'bg-status-offline-bg',
    Icon: MinusCircle,
  },
};

export function RobotCard({ robot, onRemove }: RobotCardProps) {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[robot.status];

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
      {/* Delete button — visible on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(robot.id);
        }}
        aria-label={`Remove ${robot.name}`}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-text-muted bg-surface-tertiary border border-border rounded-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-status-critical hover:border-status-critical focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:opacity-100"
      >
        <Trash2 size={12} />
      </button>

      {/* Header: name + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-text-secondary" />
          <span className="font-sans text-sm font-semibold text-text-primary">
            {robot.name}
          </span>
        </div>
        {/* Triple-redundant status: color + icon + label */}
        <span
          className={`flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm ${config.color} ${config.bg}`}
        >
          <config.Icon size={12} />
          {config.label}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Data rows */}
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
