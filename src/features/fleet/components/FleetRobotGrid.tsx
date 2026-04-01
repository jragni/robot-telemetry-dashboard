import { RobotCard } from './RobotCard/RobotCard';
import type { FleetRobotGridProps } from '@/features/fleet/types/FleetOverview.types';

/** FleetRobotGrid
 * @description Renders the robot cards in a responsive grid layout.
 * @param robots - Array of robot connections to display.
 * @param onRemove - Callback to remove a robot by id.
 */
export function FleetRobotGrid({ robots, onRemove }: FleetRobotGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {robots.map((robot) => (
        <RobotCard key={robot.id} robot={robot} onRemove={onRemove} />
      ))}
    </div>
  );
}
