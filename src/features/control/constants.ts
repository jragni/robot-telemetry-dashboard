// control section constants

// Units in m/s
export const VELOCITY_LIMITS = {
  linear: { min: 0, max: 1.0, default: 0.15 },
  angular: { min: 0, max: 2.0, default: 0.39 },
};

// Mock control topics for ROS2 (will be replaced with actual topics from rosbridge)
export const AVAILABLE_CONTROL_TOPICS = [
  { label: 'Default (cmd_vel)', value: '/cmd_vel' },
  { label: 'Cmd Vel Unstamped', value: '/cmd_vel_unstamped' },
  {
    label: 'Diff Drive Controller',
    value: '/diff_drive_controller/cmd_vel_unstamped',
  },
  { label: 'Mobile Base Controller', value: '/mobile_base_controller/cmd_vel' },
];

// ROS2 message type for cmd_vel (geometry_msgs/msg/Twist)
export const CMD_VEL_MESSAGE_TYPE = 'geometry_msgs/msg/Twist';
