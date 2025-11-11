// Dynamic LIDAR points visualization

import type { LidarPointsProps } from './definitions';
import { calculateLidarPoint } from './helpers';

function LidarPoints({ lidarData, viewRange }: LidarPointsProps) {
  return (
    <>
      {lidarData.ranges.map((range, i) => {
        // Skip points beyond view range
        if (range > viewRange) return null;

        const point = calculateLidarPoint(
          range,
          lidarData.angle_min,
          lidarData.angle_increment,
          i,
          viewRange
        );

        return (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="0.8"
            fill={point.color}
            opacity="0.8"
          />
        );
      })}
    </>
  );
}

export default LidarPoints;
