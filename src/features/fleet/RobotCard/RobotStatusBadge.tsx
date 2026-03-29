import type { ConnectionStatus } from '../../../shared/stores/connection/useConnectionStore.types';
import { STATUS_CONFIG } from './RobotCard.constants';

interface RobotStatusBadgeProps {
  readonly status: ConnectionStatus;
}

export function RobotStatusBadge({ status }: RobotStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm ${config.color} ${config.bg}`}
    >
      <config.Icon size={12} />
      {config.label}
    </span>
  );
}
