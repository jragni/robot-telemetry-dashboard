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
    <div className="bg-card/80 backdrop-blur-md rounded-sm h-full p-2">
      {/* Lidar polar grid */}
      <div
        className="relative bg-secondary border border-border rounded-sm overflow-hidden"
        style={{ aspectRatio: '1/1' }}
      >
        {!isConnected ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[10px] font-mono text-muted-foreground text-center">
              Not connected
            </p>
          </div>
        ) : loading || !lidarData ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[10px] font-mono text-muted-foreground">
              Waiting for LIDAR...
            </p>
          </div>
        ) : (
          <>
            <svg
              className="w-full h-full"
              viewBox="-100 -100 200 200"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid circles */}
              {[25, 50, 75, 100].map((r) => (
                <circle
                  key={r}
                  cx="0"
                  cy="0"
                  r={r}
                  fill="none"
                  stroke="rgb(51 65 85)"
                  strokeWidth="0.5"
                />
              ))}

              {/* Grid lines */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={angle}
                    x1="0"
                    y1="0"
                    x2={Math.cos(rad) * 100}
                    y2={Math.sin(rad) * 100}
                    stroke="rgb(51 65 85)"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Lidar points with distance-based coloring */}
              {lidarData.ranges.map((range, i) => {
                // Skip points beyond view range
                if (range > viewRange) return null;

                const angle =
                  lidarData.angle_min +
                  i * lidarData.angle_increment -
                  Math.PI / 2;
                // Normalize based on view range instead of sensor max
                const normalizedRange = (range / viewRange) * 100;
                const x = Math.cos(angle) * normalizedRange;
                const y = Math.sin(angle) * normalizedRange;

                // Distance-based coloring relative to view range
                const distanceRatio = range / viewRange;
                let color: string;
                if (distanceRatio < 0.3) {
                  // Near: Red (danger)
                  color = 'rgb(239 68 68)';
                } else if (distanceRatio < 0.6) {
                  // Medium: Yellow (caution)
                  color = 'rgb(234 179 8)';
                } else {
                  // Far: Green (safe)
                  color = 'rgb(34 197 94)';
                }

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="0.8"
                    fill={color}
                    opacity="0.8"
                  />
                );
              })}

              {/* Robot center */}
              <circle cx="0" cy="0" r="3" fill="rgb(239 68 68)" />
            </svg>

            {/* Range display */}
            <div className="absolute bottom-1 left-1 text-[10px] font-mono text-muted-foreground bg-card/90 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
              View: {viewRange.toFixed(1)}m | Max:{' '}
              {lidarData.range_max.toFixed(1)}m
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PilotLidarMinimap;
