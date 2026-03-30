import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { RobotCard } from './components/RobotCard/RobotCard';
import { FleetEmptyState } from './components/FleetEmptyState';
import { AddRobotModal } from './components/AddRobotModal';
import type { RobotConnection } from '@/stores/connection/useConnectionStore.types';

/**
 * @description FleetEmptyView — Renders the centered empty state when no robots are connected.
 */
function FleetEmptyView() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <FleetEmptyState
        onAddRobot={() => {
          /* noop — modal trigger is in header */
        }}
      />
    </div>
  );
}

/**
 * @description FleetRobotGrid — Renders the robot cards in a responsive grid layout.
 * @param robots - Array of robot connections to display.
 * @param onRemove - Callback to remove a robot by id.
 */
function FleetRobotGrid({
  robots,
  onRemove,
}: {
  robots: RobotConnection[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {robots.map((robot) => (
        <RobotCard key={robot.id} robot={robot} onRemove={onRemove} />
      ))}
    </div>
  );
}

/**
 * @description FleetOverview — Renders the fleet page showing robot cards grid or empty state
 *  with Add Robot modal.
 */
export function FleetOverview() {
  const robots = useConnectionStore((s) => s.robots);
  const removeRobot = useConnectionStore((s) => s.removeRobot);
  const robotList = Object.values(robots);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-sans text-xl font-semibold text-text-primary">
          Fleet Overview
        </h1>
        <AddRobotModal />
      </div>

      {robotList.length === 0 ? (
        <FleetEmptyView />
      ) : (
        <FleetRobotGrid robots={robotList} onRemove={removeRobot} />
      )}
    </div>
  );
}
