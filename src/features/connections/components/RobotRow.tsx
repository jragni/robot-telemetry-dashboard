import { Radio, Trash2, Unplug } from 'lucide-react';

import type { RobotRowProps } from './ConnectionsSidebar.types';

import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { cn } from '@/lib/utils';
import { useRosStore } from '@/stores/ros/ros.store';

function RobotRow({
  robot,
  isActive,
  onSelect,
  onConnect,
  onDisconnect,
  onDeleteRequest,
}: RobotRowProps) {
  const connectionState = useRosStore((s) => s.getConnectionState(robot.id));
  const isConnected = connectionState === 'connected';

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(robot.id);
    }
  }

  return (
    <div
      data-testid={`robot-row-${robot.id}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(robot.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Select robot ${robot.name}`}
      aria-pressed={isActive}
      className={cn(
        'group flex flex-col gap-1.5 rounded-sm border p-2.5 cursor-pointer transition-colors',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      {/* Name + status indicator */}
      <div className="flex items-center gap-2 min-w-0">
        <StatusIndicator state={connectionState} />
        <span className="flex-1 truncate font-mono text-xs font-semibold text-foreground">
          {robot.name}
        </span>
      </div>

      {/* Base URL */}
      <span className="truncate font-mono text-[10px] text-muted-foreground">
        {robot.baseUrl}
      </span>

      {/* Action row */}
      <div className="flex items-center gap-1 mt-0.5">
        {/* Connect / Disconnect */}
        {isConnected ? (
          <button
            type="button"
            aria-label={`Disconnect ${robot.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onDisconnect(robot.id);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <Unplug className="w-2.5 h-2.5" aria-hidden="true" />
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            aria-label={`Connect ${robot.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onConnect(robot.id);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <Radio className="w-2.5 h-2.5" aria-hidden="true" />
            Connect
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          aria-label={`Delete ${robot.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(robot);
          }}
          className="ml-auto flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
        >
          <Trash2 className="w-2.5 h-2.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export { RobotRow };
