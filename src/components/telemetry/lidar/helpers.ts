import type { TopicInfo } from '@/contexts/ros/definitions';

/**
 * Filter topics to only include LaserScan topics
 */
export function filterLidarTopics(topics: TopicInfo[]): string[] {
  return topics
    .filter((topic) => topic.type === 'sensor_msgs/msg/LaserScan')
    .map((topic) => topic.name);
}

/**
 * Get color for a lidar point based on distance
 * @param range - Distance to the point
 * @param viewRange - Current view range
 * @returns RGB color string
 */
export function getLidarPointColor(range: number, viewRange: number): string {
  const distanceRatio = range / viewRange;

  if (distanceRatio < 0.3) {
    // Near: Red (danger)
    return 'rgb(239 68 68)';
  } else if (distanceRatio < 0.6) {
    // Medium: Yellow (caution)
    return 'rgb(234 179 8)';
  } else {
    // Far: Green (safe)
    return 'rgb(34 197 94)';
  }
}
