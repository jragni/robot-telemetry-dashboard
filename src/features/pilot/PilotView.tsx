import { useParams, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { useRobotConnection } from '@/hooks/useRobotConnection';
import { useControlPublisher } from '@/hooks/useControlPublisher/useControlPublisher';
import { PilotCamera } from './components/PilotCamera';
import { PilotHud } from './components/PilotHud';
import { PilotHudMobile } from './components/PilotHudMobile';
import { useWebRtcStream } from '@/hooks/useWebRtcStream/useWebRtcStream';
import { useRosTopics } from '@/hooks/useRosTopics';
import { useBatterySubscription } from '@/hooks/useBatterySubscription';
import { useLidarSubscription } from '@/features/workspace/hooks/useLidarSubscription';
import { useImuSubscription } from '@/features/workspace/hooks/useImuSubscription';
import { usePilotFullscreen } from './hooks/usePilotFullscreen';
import { PILOT_FULLSCREEN_Z } from './constants';
import type { ProxyStatus } from './types/PilotView.types';

/** PilotView
 * @description Renders the Pilot Mode page — a camera-first FPV view with
 *  translucent HUD overlays for robot teleoperation. Reads robot info from
 *  the connection store (read-only). All other state is self-contained.
 */
export function PilotView() {
  const { id } = useParams<{ id: string }>();
  const robot = useConnectionStore((s) => (id ? s.robots[id] : undefined));
  const { ros, connected } = useRobotConnection(id);
  const selectedTopics = robot?.selectedTopics;
  const controls = useControlPublisher({ ros, topicName: selectedTopics?.controls });
  const { status: videoStatus, videoRef } = useWebRtcStream({
    url: robot?.url ?? '',
    enabled: !!robot,
  });
  const { isFullscreen, toggleFullscreen } = usePilotFullscreen();
  const isMobile = useIsMobile();

  // ── ROS subscriptions (shared topics from workspace) ─────────────
  const availableTopics = useRosTopics(ros);
  const lidar = useLidarSubscription(ros, selectedTopics?.lidar ?? '/scan');
  const imu = useImuSubscription(ros, selectedTopics?.imu ?? '/imu/data');
  const battery = useBatterySubscription(ros, availableTopics);

  // Convert polar LidarPoints (workspace) to Cartesian (pilot minimap)
  const pilotLidarPoints = lidar.points.map((p) => ({
    x: Math.cos(p.angle) * p.distance,
    y: Math.sin(p.angle) * p.distance,
    distance: p.distance,
  }));

  const telemetry = {
    imu: connected ? { roll: imu.roll, pitch: imu.pitch, yaw: imu.yaw } : null,
    lidarPoints: pilotLidarPoints,
    lidarRangeMax: lidar.rangeMax,
    battery: battery ? { percentage: battery.percentage, voltage: battery.voltage } : null,
    linearSpeed: 0,
    uptimeSeconds: null,
  };

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

  const rosbridgeStatus: ProxyStatus = connected ? 'connected' : 'disconnected';

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-clip bg-surface-base',
        isFullscreen && `fixed inset-0 ${PILOT_FULLSCREEN_Z}`,
      )}
      style={{ overscrollBehavior: 'contain' }}
    >
      <PilotCamera videoStatus={videoStatus} videoRef={videoRef} />

      {isMobile ? (
        <PilotHudMobile
          telemetry={telemetry}
          videoStatus={videoStatus}
          rosbridgeStatus={rosbridgeStatus}
          connected={connected}
          linearVelocity={controls.linearVelocity}
          angularVelocity={controls.angularVelocity}
          onDirectionStart={controls.handleDirectionStart}
          onDirectionEnd={controls.handleDirectionEnd}
          onLinearVelocityChange={controls.handleLinearChange}
          onAngularVelocityChange={controls.handleAngularChange}
          onEmergencyStop={controls.handleEmergencyStop}
        />
      ) : (
        <PilotHud
          telemetry={telemetry}
          videoStatus={videoStatus}
          rosbridgeStatus={rosbridgeStatus}
          isFullscreen={isFullscreen}
          connected={connected}
          onToggleFullscreen={toggleFullscreen}
          linearVelocity={controls.linearVelocity}
          angularVelocity={controls.angularVelocity}
          onDirectionStart={controls.handleDirectionStart}
          onDirectionEnd={controls.handleDirectionEnd}
          onLinearVelocityChange={controls.handleLinearChange}
          onAngularVelocityChange={controls.handleAngularChange}
          onEmergencyStop={controls.handleEmergencyStop}
          robotId={id}
        />
      )}
    </div>
  );
}
