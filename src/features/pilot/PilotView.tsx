import { useParams, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DesktopOnlyGate } from '@/components/DesktopOnlyGate';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { useControlPublisher } from '@/hooks/useControlPublisher/useControlPublisher';
import { PilotCamera } from './components/PilotCamera';
import { PilotHud } from './components/PilotHud';
import { useWebRtcStream } from './hooks/useWebRtcStream';
import { usePilotFullscreen } from './hooks/usePilotFullscreen';
import { PLACEHOLDER_TELEMETRY, PILOT_FULLSCREEN_Z } from './constants';
import type { ProxyStatus } from './types/PilotView.types';

/** PilotView
 * @description Renders the Pilot Mode page — a camera-first FPV view with
 *  translucent HUD overlays for robot teleoperation. Reads robot info from
 *  the connection store (read-only). All other state is self-contained.
 */
export function PilotView() {
  const { id } = useParams<{ id: string }>();
  const robot = useConnectionStore((s) => (id ? s.robots[id] : undefined));
  const controls = useControlPublisher();
  const { status: videoStatus, videoRef } = useWebRtcStream(robot?.url ?? '', !!robot);
  const { isFullscreen, toggleFullscreen } = usePilotFullscreen();

  // TODO: Replace with usePilotTelemetry (pair-programmed)
  const telemetry = PLACEHOLDER_TELEMETRY;

  if (!robot) {
    return (
      <section
        aria-label="Robot not found"
        className="flex flex-col items-center justify-center h-full gap-4"
      >
        <p className="font-mono text-xs text-text-muted">Robot not found: {id}</p>
        <Link to="/fleet" className="font-mono text-xs text-accent hover:underline">
          Back to Fleet
        </Link>
      </section>
    );
  }

  const connected = robot.status === 'connected';
  const rosbridgeStatus: ProxyStatus = connected ? 'connected' : 'disconnected';

  return (
    <DesktopOnlyGate>
      <div
        className={cn(
          'relative w-full h-full overflow-hidden bg-surface-base',
          isFullscreen && `fixed inset-0 ${PILOT_FULLSCREEN_Z}`,
        )}
      >
        <PilotCamera videoStatus={videoStatus} videoRef={videoRef} />

        <PilotHud
          telemetry={telemetry}
          videoStatus={videoStatus}
          rosbridgeStatus={rosbridgeStatus}
          isFullscreen={isFullscreen}
          connected={connected}
          onToggleFullscreen={toggleFullscreen}
          activeDirection={null}
          linearVelocity={controls.linearVelocity}
          angularVelocity={controls.angularVelocity}
          isActive={controls.isActive}
          onDirectionStart={controls.handleDirectionStart}
          onDirectionEnd={controls.handleDirectionEnd}
          onLinearVelocityChange={controls.handleLinearChange}
          onAngularVelocityChange={controls.handleAngularChange}
          onEmergencyStop={controls.handleEmergencyStop}
        />
      </div>
    </DesktopOnlyGate>
  );
}
