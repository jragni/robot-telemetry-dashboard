// Topics list constants

import type { Topic } from './definitions';

export const MOCK_TOPICS: Topic[] = [
  {
    name: '/camera/image_raw',
    type: 'sensor_msgs/Image',
    rate: 30,
    active: true,
  },
  { name: '/scan', type: 'sensor_msgs/LaserScan', rate: 10, active: true },
  { name: '/imu/data', type: 'sensor_msgs/Imu', rate: 100, active: true },
  { name: '/odom', type: 'nav_msgs/Odometry', rate: 50, active: true },
  { name: '/cmd_vel', type: 'geometry_msgs/Twist', rate: 10, active: false },
  {
    name: '/joint_states',
    type: 'sensor_msgs/JointState',
    rate: 50,
    active: true,
  },
  {
    name: '/battery_state',
    type: 'sensor_msgs/BatteryState',
    rate: 1,
    active: true,
  },
  {
    name: '/diagnostics',
    type: 'diagnostic_msgs/DiagnosticArray',
    rate: 1,
    active: true,
  },
  { name: '/map', type: 'nav_msgs/OccupancyGrid', rate: 0.1, active: false },
  { name: '/tf', type: 'tf2_msgs/TFMessage', rate: 100, active: true },
];
