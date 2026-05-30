// Sensor topics are left empty so panels never subscribe to a guessed name before
// discovery completes — useTopicManager auto-selects the real published topic each
// poll. controls (/cmd_vel) is a publish target the robot may not advertise in topic
// discovery, so it keeps the ROS-standard default to stay publishable.
export const DEFAULT_PANEL_TOPICS: Record<string, string> = {
  camera: '',
  controls: '/cmd_vel',
  imu: '',
  lidar: '',
  telemetry: '',
};
