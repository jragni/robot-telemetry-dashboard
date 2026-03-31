import { Link } from 'react-router-dom';
import { Crosshair, Unplug, PlugZap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RobotCardActionsProps } from '../types/RobotCardActions.types';
import { RobotDeleteButton } from './RobotDeleteButton';

/** RobotCardActions
 * @description Renders the card action row with View, Pilot, Disconnect/Reconnect,
 *  and delete buttons.
 * @param robotId - Robot identifier for navigation links.
 * @param robotName - Robot name for delete button aria-label.
 * @param status - Current connection status (for disconnect/reconnect toggle).
 * @param onRemove - Callback invoked when user confirms deletion.
 */
export function RobotCardActions({
  robotId,
  robotName,
  status,
  onRemove,
}: RobotCardActionsProps) {
  // TODO: Wire disconnect/reconnect actions:
  // - connected → "Disconnect" triggers graceful roslib disconnect
  // - disconnected → "Reconnect" triggers roslib reconnect
  // - connecting → show spinner, disable button
  const isConnected = status === 'connected';
  const ConnectionIcon = isConnected ? Unplug : PlugZap;
  const connectionLabel = isConnected ? 'Disconnect' : 'Connect';

  return (
    <div className="flex flex-col gap-0 w-full">
      <div className="flex items-center gap-2 pb-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="font-sans text-xs uppercase tracking-widest text-accent border-accent hover:bg-accent-subtle"
        >
          <Link to={`/robot/${robotId}`}>View</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="font-sans text-xs uppercase tracking-widest text-text-secondary"
        >
          <Link to={`/pilot/${robotId}`}>
            <Crosshair size={12} aria-hidden="true" />
            Pilot
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          disabled
          className="flex-1 font-sans text-xs uppercase tracking-widest"
          aria-label={`${connectionLabel} robot (not yet available)`}
        >
          <ConnectionIcon size={12} aria-hidden="true" />
          {connectionLabel}
        </Button>
        <RobotDeleteButton robotName={robotName} onRemove={onRemove} />
      </div>
    </div>
  );
}
