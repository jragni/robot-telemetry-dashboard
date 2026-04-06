import { useConnectionStore } from '@/stores/connection/useConnectionStore';

import { AddRobotModal } from './components/AddRobotModal';
import { FleetEmptyView } from './components/FleetEmptyView';
import { FleetRobotGrid } from './components/FleetRobotGrid';

/** FleetOverview
 * @description Renders the fleet page showing robot cards grid or empty state
 *  with Add Robot modal.
 */
export function FleetOverview() {
  const robots = useConnectionStore((s) => s.robots);
  const removeRobot = useConnectionStore((s) => s.removeRobot);
  const robotList = Object.values(robots);
  const hasRobots = robotList.length > 0;

  return (
    <section className="h-full flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <h1 className="font-sans text-xl font-semibold text-text-primary">
          Fleet Overview
        </h1>
        {hasRobots && <AddRobotModal />}
      </header>

      {hasRobots ? (
        <FleetRobotGrid robots={robotList} onRemove={removeRobot} />
      ) : (
        <FleetEmptyView />
      )}
    </section>
  );
}
