import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { useConnectionsStore } from '@/stores/connections/connections.store';
import { useRosStore } from '@/stores/ros.store';

export function ActiveRobotBadge() {
  const activeRobot = useConnectionsStore((s) => s.getActiveRobot());
  const connectionState = useRosStore((s) =>
    activeRobot ? s.getConnectionState(activeRobot.id) : 'disconnected'
  );

  if (!activeRobot) {
    return (
      <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        No robot selected
      </span>
    );
  }

  return (
    <span className="hidden sm:flex items-center gap-1.5">
      <StatusIndicator state={connectionState} />
      <span className="font-mono text-xs text-foreground truncate max-w-[120px]">
        {activeRobot.name}
      </span>
    </span>
  );
}
