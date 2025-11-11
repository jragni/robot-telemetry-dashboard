import { getLidarPointColor } from './helpers';

import type { LaserScanMessage } from '@/contexts/ros/definitions';

interface LidarVisualizationProps {
  lidarData: LaserScanMessage;
  viewRange: number;
}

export function LidarVisualization({
  lidarData,
  viewRange,
}: LidarVisualizationProps) {
  return (
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
          stroke="rgb(100 116 139)"
          strokeWidth="0.7"
          opacity="0.6"
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
            stroke="rgb(100 116 139)"
            strokeWidth="0.7"
            opacity="0.6"
          />
        );
      })}

      {/* Lidar points */}
      {lidarData.ranges.map((range, i) => {
        // Skip points beyond view range
        if (range > viewRange) return null;

        const angle =
          lidarData.angle_min + i * lidarData.angle_increment - Math.PI / 2;
        // Normalize based on view range instead of sensor max
        const normalizedRange = (range / viewRange) * 100;
        const x = Math.cos(angle) * normalizedRange;
        const y = Math.sin(angle) * normalizedRange;

        // Distance-based coloring relative to view range
        const color = getLidarPointColor(range, viewRange);

        return (
          <circle key={i} cx={x} cy={y} r="0.8" fill={color} opacity="0.8" />
        );
      })}

      {/* Robot center */}
      <circle cx="0" cy="0" r="3" fill="rgb(239 68 68)" />
    </svg>
  );
}
