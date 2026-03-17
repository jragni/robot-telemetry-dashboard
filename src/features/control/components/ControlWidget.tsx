import { TopicSelector } from './TopicSelector';
import { VelocitySliders } from './VelocitySliders';

import { ControlPad } from '@/components/shared/ControlPad';
import { NoConnectionOverlay } from '@/components/shared/NoConnectionOverlay';
import { useRosConnection } from '@/hooks/useRosConnection';
import type { PanelComponentProps } from '@/types/panel.types';

// ---------------------------------------------------------------------------
// ControlWidget
// ---------------------------------------------------------------------------

/**
 * Top-level robot control panel widget.
 *
 * Composes:
 * - TopicSelector — choose which cmd_vel topic to publish on
 * - ControlPad    — directional d-pad with e-stop
 * - VelocitySliders — tune linear / angular velocity limits
 *
 * A full-panel NoConnectionOverlay is shown whenever the robot connection
 * is not in the 'connected' state so the operator cannot accidentally issue
 * commands to a disconnected robot.
 */
export function ControlWidget({
  robotId,
  panelId: _panelId,
}: PanelComponentProps) {
  const { connectionState } = useRosConnection(robotId);
  const isConnected = connectionState === 'connected';

  return (
    <div className="relative flex flex-col w-full h-full overflow-hidden">
      {/* Connection overlay (renders on top when not connected) */}
      {!isConnected && (
        <NoConnectionOverlay connectionState={connectionState} />
      )}

      {/* Panel content */}
      <div className="flex flex-col gap-4 p-3 overflow-y-auto flex-1 min-h-0">
        {/* Topic selector */}
        <TopicSelector robotId={robotId} />

        {/* D-pad control */}
        <ControlPad robotId={robotId} />

        {/* Velocity tuning */}
        <div className="pt-1 border-t border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Velocity
          </p>
          <VelocitySliders robotId={robotId} />
        </div>
      </div>
    </div>
  );
}
