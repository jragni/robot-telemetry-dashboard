import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  useBatterySubscription,
  useControlPublisher,
  useImuSubscription,
  useIsMobile,
  useLidarSubscription,
  useRobotConnection,
  useRosTopics,
  useWebRtcStream,
} from '@/hooks';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { cn } from '@/lib/utils';

import { usePilotFullscreen } from './hooks/usePilotFullscreen';
import { PilotCamera } from './components/PilotCamera';
import { PilotHud } from './components/PilotHud/PilotHud';
import { PilotHudMobile } from './components/PilotHud/PilotHudMobile';
import { PilotNotFound } from './components/PilotNotFound/PilotNotFound';
import { WebRtcStatsOverlay } from './components/WebRtcStatsOverlay';
import { PILOT_FULLSCREEN_Z } from './constants';
import type { ProxyStatus } from './types/PilotPage.types';

/** PilotPage
 * @description Renders the Pilot Mode page — a camera-first FPV view with
 *  translucent HUD overlays for robot teleoperation. Reads robot info from
 *  the connection store (read-only). All other state is self-contained.
 */
export function PilotPage() {
  const { id } = useParams<{ id: string }>();
  const robot = useConnectionStore((s) => (id ? s.robots[id] : undefined));
  const connectRobot = useConnectionStore((s) => s.connectRobot);
  const { ros, connected } = useRobotConnection(id);
  const selectedTopics = robot?.selectedTopics;
  const controls = useControlPublisher({ ros, topicName: selectedTopics?.controls });
  const {
    pc,
    status: videoStatus,
    videoRef,
  } = useWebRtcStream({
    connected,
    enabled: !!robot,
    url: robot?.url ?? '',
  });
  const { isFullscreen, toggleFullscreen } = usePilotFullscreen();
  const isMobile = useIsMobile();
  const handleReconnect = useCallback(() => {
    if (id) void connectRobot(id);
  }, [connectRobot, id]);

  const availableTopics = useRosTopics(ros);
  const lidar = useLidarSubscription(ros, selectedTopics?.lidar ?? '');
  const imu = useImuSubscription(ros, selectedTopics?.imu ?? '');
  const battery = useBatterySubscription(ros, availableTopics);

  // Convert polar LidarPoints (workspace) to Cartesian (pilot minimap)
  const pilotLidarPoints = useMemo(
    () =>
      lidar.points.map((p) => ({
        x: Math.cos(p.angle) * p.distance,
        y: Math.sin(p.angle) * p.distance,
        distance: p.distance,
      })),
    [lidar.points],
  );

  const telemetry = useMemo(
    () => ({
      battery: battery ? { percentage: battery.percentage, voltage: battery.voltage } : null,
      imu: connected ? { pitch: imu.pitch, roll: imu.roll, yaw: imu.yaw } : null,
      lidarPoints: pilotLidarPoints,
      lidarRangeMax: lidar.rangeMax,
      linearSpeed: 0,
      uptimeSeconds: null,
    }),
    [connected, imu.roll, imu.pitch, imu.yaw, pilotLidarPoints, lidar.rangeMax, battery],
  );

  if (!robot) {
    return <PilotNotFound robotId={id} />;
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

      <WebRtcStatsOverlay pc={pc} url={robot.url} />

      {isMobile ? (
        <PilotHudMobile
          angularVelocity={controls.angularVelocity}
          connected={connected}
          linearVelocity={controls.linearVelocity}
          onAngularVelocityChange={controls.handleAngularChange}
          onDirectionEnd={controls.handleDirectionEnd}
          onDirectionStart={controls.handleDirectionStart}
          onEmergencyStop={controls.handleEmergencyStop}
          onLinearVelocityChange={controls.handleLinearChange}
          onReconnect={handleReconnect}
          rosbridgeStatus={rosbridgeStatus}
          telemetry={telemetry}
          videoStatus={videoStatus}
        />
      ) : (
        <PilotHud
          angularVelocity={controls.angularVelocity}
          connected={connected}
          isFullscreen={isFullscreen}
          linearVelocity={controls.linearVelocity}
          onAngularVelocityChange={controls.handleAngularChange}
          onDirectionEnd={controls.handleDirectionEnd}
          onDirectionStart={controls.handleDirectionStart}
          onEmergencyStop={controls.handleEmergencyStop}
          onLinearVelocityChange={controls.handleLinearChange}
          onReconnect={handleReconnect}
          onToggleFullscreen={toggleFullscreen}
          robotId={id}
          rosbridgeStatus={rosbridgeStatus}
          telemetry={telemetry}
          videoStatus={videoStatus}
        />
      )}
    </div>
  );
}
