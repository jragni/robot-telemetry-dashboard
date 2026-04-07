import { RobotCard } from './RobotCard';
import type { FleetRobotGridProps } from './FleetRobotGrid.types';

/** FleetRobotGrid
 * @description Renders the robot cards in a responsive grid layout.
 * @prop robots - Array of robot connections to display.
 * @prop onRemove - Callback to remove a robot by id.
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
