import type { RobotCardGraphProps } from '../../types/RobotCardGraph.types';
import { RobotCardDataRow } from './RobotCardDataRow';

/** RobotCardGraph
 * @description Renders ROS computation graph counts: nodes, topics,
 *  services, and actions.
 * @param isConnected - Whether the robot is currently connected.
 */
export function RobotCardGraph({ isConnected }: RobotCardGraphProps) {
  const val = isConnected ? '—' : '—';

  return (
    <dl className="flex flex-col gap-2">
      <RobotCardDataRow label="Nodes" value={val} />
      <RobotCardDataRow label="Topics" value={val} />
      <RobotCardDataRow label="Services" value={val} />
      <RobotCardDataRow label="Actions" value={val} />
    </dl>
  );
}
