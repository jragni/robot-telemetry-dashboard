import type { FleetRobotGridProps } from '@/features/fleet/types/FleetOverview.types';

import { RobotCard } from './RobotCard/RobotCard';

/** FleetRobotGrid
 * @description Renders the robot cards in a responsive grid layout.
 * @param robots - Array of robot connections to display.
 * @param onRemove - Callback to remove a robot by id.
 */
export function FleetRobotGrid({ robots, onRemove }: FleetRobotGridProps) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 list-none">
      {robots.map((robot) => (
        <li key={robot.id}>
          <RobotCard robot={robot} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  );
}
