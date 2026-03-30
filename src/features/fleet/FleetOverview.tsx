import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { RobotCard } from './components/RobotCard/RobotCard';
import { FleetEmptyState } from './components/FleetEmptyState';
import { AddRobotModal } from './components/AddRobotModal';

/**
 * Fleet page showing robot cards grid or empty state with Add Robot modal.
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
        <div className="flex-1 flex items-center justify-center">
          <FleetEmptyState
            onAddRobot={() => {
              /* noop — modal trigger is in header */
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {robotList.map((robot) => (
            <RobotCard key={robot.id} robot={robot} onRemove={removeRobot} />
          ))}
        </div>
      )}
    </div>
  );
}
