import type { RobotStatusBadgeProps } from '../types/RobotStatusBadge.types';
import { STATUS_CONFIG } from '../constants';

/** RobotStatusBadge
 * @description Renders a triple-redundant status indicator
 *  (color dot + icon + text label).
 * @prop status - The connection status to display.
 */
export function RobotStatusBadge({ status }: RobotStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={`flex items-center gap-2 font-sans text-xs ${config.color}`}>
      <config.Icon size={12} className={status === 'connecting' ? 'animate-spin' : undefined} />
      {config.label}
    </span>
  );
}
