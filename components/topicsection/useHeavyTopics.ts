export const useHeavyTopics = () => {
  // Heavy data types that should not have live updates
  const heavyTypes = [
    'sensor_msgs/msg/Image',
    'sensor_msgs/msg/CompressedImage',
    'sensor_msgs/msg/PointCloud2',
    'sensor_msgs/msg/PointCloud',
    'visualization_msgs/msg/MarkerArray',
    'nav_msgs/msg/OccupancyGrid',
  ];

  const isHeavyTopic = (messageType: string) => heavyTypes.includes(messageType);

  return { isHeavyTopic };
};