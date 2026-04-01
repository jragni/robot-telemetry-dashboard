import { Link } from 'react-router-dom';
import { Crosshair, Loader2, Unplug, PlugZap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RobotCardActionsProps } from '../types/RobotCardActions.types';
import { RobotDeleteButton } from './RobotDeleteButton';

/** RobotCardActions
 * @description Renders the card action row with View, Pilot, Connect/Disconnect,
 *  and delete buttons.
 * @param robotId - Robot identifier for navigation links.
 * @param robotName - Robot name for delete button aria-label.
 * @param status - Current connection status.
 * @param onRemove - Callback invoked when user confirms deletion.
 * @param onConnect - Callback to initiate robot connection.
 * @param onDisconnect - Callback to disconnect robot.
 */
export function RobotCardActions({
  robotId,
  robotName,
  status,
  onRemove,
  onConnect,
  onDisconnect,
}: RobotCardActionsProps) {
  const isConnecting = status === 'connecting';
  const isConnected = status === 'connected';

  function handleConnectionToggle() {
    if (isConnected) {
      onDisconnect();
    } else {
      onConnect();
    }
  }

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
          disabled={isConnecting}
          onClick={handleConnectionToggle}
          className="flex-1 font-sans text-xs uppercase tracking-widest cursor-pointer transition"
          aria-label={isConnecting ? 'Connecting to robot' : isConnected ? `Disconnect ${robotName}` : `Connect ${robotName}`}
        >
          {isConnecting ? (
            <>
              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
              Connecting
            </>
          ) : isConnected ? (
            <>
              <Unplug size={12} aria-hidden="true" />
              Disconnect
            </>
          ) : (
            <>
              <PlugZap size={12} aria-hidden="true" />
              Connect
            </>
          )}
        </Button>
        <RobotDeleteButton robotName={robotName} onRemove={onRemove} />
      </div>
    </div>
  );
}
