import type { RobotStatusBadgeProps } from '../types/RobotStatusBadge.types';
import { STATUS_CONFIG } from '../constants';

/** RobotStatusBadge
 * @description Renders a triple-redundant status indicator
 *  (color dot + icon + text label).
 * @param status - The connection status to display.
 */
export function RobotStatusBadge({ status }: RobotStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`flex items-center gap-2 font-mono text-xs ${config.color}`}
    >
      <config.Icon size={12} />
      <span className="font-sans">{config.label}</span>
    </span>
  );
}
