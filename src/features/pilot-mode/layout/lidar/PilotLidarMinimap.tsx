import LidarGrid from './LidarGrid';
import LidarPoints from './LidarPoints';

import type { LaserScanMessage } from '@/features/ros/definitions';
import { useRosContext } from '@/features/ros/RosContext';
import { useSubscriber } from '@/features/ros/useSubscriber';
import { DEFAULT_LIDAR_TOPIC } from '@/features/telemetry/lidar/constants';
import { useLidarZoom } from '@/features/telemetry/lidar/LidarZoomContext';

function PilotLidarMinimap() {
  const { connectionState } = useRosContext();
  const { viewRange } = useLidarZoom();

  const { data: lidarData, loading } = useSubscriber<LaserScanMessage>({
    topic: DEFAULT_LIDAR_TOPIC,
    messageType: 'sensor_msgs/msg/LaserScan',
    throttleRate: 200, // 5 Hz
    enabled: connectionState === 'connected',
  });

  const isConnected = connectionState === 'connected';

  return (
    <div className="backdrop-blur-lg rounded-sm h-full p-1.5 sm:p-2 opacity-90">
      {!isConnected ? (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-xs font-mono text-gray-900 dark:text-[#E8E8E8] text-center">
            Not connected
          </p>
        </div>
      ) : loading || !lidarData ? (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-xs font-mono text-gray-900 dark:text-[#E8E8E8]">
            Waiting for LIDAR...
          </p>
        </div>
      ) : (
        <svg
          className="w-full h-full"
          viewBox="-100 -100 200 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <LidarGrid />
          <LidarPoints lidarData={lidarData} viewRange={viewRange} />
        </svg>
      )}
    </div>
  );
}

export default PilotLidarMinimap;
