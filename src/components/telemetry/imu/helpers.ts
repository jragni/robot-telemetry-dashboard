import type { IMUData } from './definitions';

import type { ImuMessage, TopicInfo } from '@/contexts/ros/definitions';

/**
 * Transform ROS ImuMessage to IMUData format
 */
export function transformImuMessage(imuRawData: ImuMessage): IMUData {
  return {
    orientation: imuRawData.orientation,
    angularVelocity: imuRawData.angular_velocity,
    linearAcceleration: imuRawData.linear_acceleration,
  };
}

/**
 * Filter topics to only include IMU topics
 */
export function filterImuTopics(topics: TopicInfo[]): string[] {
  return topics
    .filter((topic) => topic.type === 'sensor_msgs/msg/Imu')
    .map((topic) => topic.name);
}
