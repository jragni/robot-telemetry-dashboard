import { OctagonX, Radio, Unplug } from 'lucide-react';
import { useNavigate } from 'react-router';

import type { RobotCardProps } from './RobotCard.types';

import { Show } from '@/components/shared/Show';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { Button } from '@/components/ui/button';
import { useFleetConnectionManager } from '@/hooks/useFleetConnectionManager';
import { cn } from '@/lib/utils';
import { useControlStore } from '@/stores/control/control.store';

// ---------------------------------------------------------------------------
// RobotCard
// ---------------------------------------------------------------------------

/**
 * Fleet overview card for a single robot.
 *
 * Shows:
 * - Robot name and base URL
 * - ROS and WebRTC connection status indicators
 * - Connect / Disconnect toggle button
 * - Pilot button (navigates to /pilot/:robotId)
 * - E-Stop button (only when connected)
 * - Compact velocity readout (only when connected)
 */
export function RobotCard({
  status,
  isSelected = false,
  onSelect,
}: RobotCardProps) {
  const navigate = useNavigate();
  const { connectRobot, disconnectRobot } = useFleetConnectionManager();

  const { robot, rosState, webrtcState, isConnected, controlState } = status;

  function handleConnectToggle() {
    if (isConnected) {
      disconnectRobot(robot.id);
    } else {
      connectRobot(robot.id);
    }
  }

  function handlePilot() {
    void navigate(`/pilot/${robot.id}`);
  }

  function handleEStop() {
    useControlStore.getState().activateEStop(robot.id);
  }

  function handleCardClick() {
    onSelect?.(robot.id);
  }

  return (
    <div
      data-testid={`robot-card-${robot.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Select robot ${robot.name}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        'flex flex-col gap-3 rounded-sm border bg-card p-4 transition-colors cursor-default',
        'border-l-2',
        isSelected
          ? 'border-primary border-l-primary ring-1 ring-primary/30'
          : 'border-border border-l-primary/60',
        onSelect && 'cursor-pointer hover:border-primary/60'
      )}
    >
      {/* Header: name + URL */}
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-sm font-semibold tracking-wide text-foreground truncate">
          {robot.name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground truncate">
          {robot.baseUrl}
        </span>
      </div>

      {/* Connection status indicators */}
      <div className="flex flex-col gap-1">
        <StatusIndicator state={rosState} label="ROS" />
        <StatusIndicator state={webrtcState} label="VIDEO" />
      </div>

      {/* Compact velocity readout — only when connected */}
      <Show when={isConnected}>
        <div className="flex gap-4 rounded border border-border/40 bg-muted/30 px-2 py-1">
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              LIN
            </span>
            <span className="font-mono text-xs tabular-nums text-foreground">
              {controlState.linearVelocity.toFixed(1)}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              ANG
            </span>
            <span className="font-mono text-xs tabular-nums text-foreground">
              {controlState.angularVelocity.toFixed(1)}
            </span>
          </span>
        </div>
      </Show>

      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Connect / Disconnect */}
        <Button
          size="sm"
          variant={isConnected ? 'outline' : 'default'}
          className="flex-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleConnectToggle();
          }}
          aria-label={isConnected ? 'Disconnect' : 'Connect'}
        >
          <Show
            when={isConnected}
            fallback={
              <>
                <Radio className="size-3 mr-1" aria-hidden="true" />
                Connect
              </>
            }
          >
            <>
              <Unplug className="size-3 mr-1" aria-hidden="true" />
              Disconnect
            </>
          </Show>
        </Button>

        {/* Pilot */}
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handlePilot();
          }}
          aria-label="Pilot"
        >
          Pilot
        </Button>

        {/* E-Stop — only when connected */}
        <Show when={isConnected}>
          <Button
            size="sm"
            variant="destructive"
            className="text-xs px-2"
            onClick={(e) => {
              e.stopPropagation();
              handleEStop();
            }}
            aria-label="E-Stop"
          >
            <OctagonX className="size-3" aria-hidden="true" />
          </Button>
        </Show>
      </div>
    </div>
  );
}
