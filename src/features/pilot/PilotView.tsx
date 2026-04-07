import { useMemo } from 'react';
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
    connected,
    enabled: !!robot,
    url: robot?.url ?? '',
  });
  const { isFullscreen, toggleFullscreen } = usePilotFullscreen();
  const isMobile = useIsMobile();

  const availableTopics = useRosTopics(ros);
  const lidar = useLidarSubscription(ros, selectedTopics?.lidar ?? '/scan');
  const imu = useImuSubscription(ros, selectedTopics?.imu ?? '/imu/data');
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
