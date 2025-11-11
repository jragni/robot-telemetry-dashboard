// control section constants

// Units in m/s
export const VELOCITY_LIMITS = {
  linear: { min: 0, max: 1.0, default: 0.15 },
  angular: { min: 0, max: 2.0, default: 0.39 },
};

// ROS2 message type for cmd_vel (geometry_msgs/msg/Twist)
export const CMD_VEL_MESSAGE_TYPE = 'geometry_msgs/msg/Twist';
