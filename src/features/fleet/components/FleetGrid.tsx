import { useFleetStatus } from '../hooks/useFleetStatus';

import { RobotCard } from './RobotCard';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FleetGridProps {
  /** Currently selected robot id (highlighted with primary border). */
  selectedRobotId?: string | null;
  /** Called when the user selects a robot card. */
  onSelectRobot?: (robotId: string) => void;
}

// ---------------------------------------------------------------------------
// FleetGrid
// ---------------------------------------------------------------------------

/**
 * Renders a vertical list of RobotCard components for every configured robot.
 *
 * Shows a summary badge (N connected / M total) at the top of the list.
 */
export function FleetGrid({ selectedRobotId, onSelectRobot }: FleetGridProps) {
  const { robots, connectedCount, totalCount } = useFleetStatus();

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          No robots configured
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
          Add a robot via the connection panel to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Summary badge */}
      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Fleet
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          <span
            className={
              connectedCount > 0 ? 'text-status-nominal' : 'text-status-offline'
            }
          >
            {connectedCount}
          </span>
          <span className="text-muted-foreground/60"> / {totalCount}</span>
        </span>
      </div>

      {/* Robot cards */}
      {robots.map((status) => (
        <RobotCard
          key={status.robot.id}
          status={status}
          isSelected={selectedRobotId === status.robot.id}
          onSelect={onSelectRobot}
        />
      ))}
    </div>
  );
}
