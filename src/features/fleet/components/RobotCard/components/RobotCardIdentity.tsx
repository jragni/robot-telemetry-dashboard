import { Bot } from 'lucide-react';
import type { RobotCardIdentityProps } from '../types/RobotCardIdentity.types';
import { RobotStatusBadge } from './RobotStatusBadge';

/** RobotCardIdentity
 * @description Renders the robot name with colored icon and
 *  connection status badge.
 * @prop name - Robot display name.
 * @prop status - Current connection status.
 * @prop iconColor - Tailwind text color class for the robot icon.
 */
export function RobotCardIdentity({ name, status, iconColor }: RobotCardIdentityProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bot size={16} className={iconColor} aria-hidden="true" />
        <h3 className="font-sans text-xl font-semibold text-text-primary">{name}</h3>
      </div>
      <RobotStatusBadge status={status} />
    </div>
  );
}
