import type { RobotCardGraphProps } from '../types/RobotCardGraph.types';
import { RobotCardDataRow } from './RobotCardDataRow';

/** RobotCardGraph
 * @description Renders ROS computation graph counts: nodes, topics,
 *  services, and actions. Shows live data when connected, dashes when not.
 * @param graph - ROS graph data, or null if not yet fetched.
 * @param isConnected - Whether the robot is currently connected.
 */
export function RobotCardGraph({ graph, isConnected }: RobotCardGraphProps) {
  const dash = '—';

  return (
    <dl className="flex flex-col gap-2">
      <RobotCardDataRow label="Nodes" value={isConnected && graph ? String(graph.nodes) : dash} />
      <RobotCardDataRow label="Topics" value={isConnected && graph ? String(graph.topics) : dash} />
      <RobotCardDataRow label="Services" value={isConnected && graph ? String(graph.services) : dash} />
      <RobotCardDataRow label="Actions" value={isConnected && graph ? String(graph.actions) : dash} />
    </dl>
  );
}
