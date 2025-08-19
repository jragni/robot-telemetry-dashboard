import { vi } from 'vitest';
import type { RobotConnection, TopicSubscription } from '@/components/dashboard/definitions';

// Mock ROSLIB
export const mockROSLIB = {
  Ros: vi.fn().mockImplementation((options: { url: string }) => ({
    url: options.url,
    socket: { binaryType: 'arraybuffer' },
    on: vi.fn(),
    close: vi.fn(),
    connect: vi.fn(),
    getTopics: vi.fn(),
  })),
  Topic: vi.fn().mockImplementation((options: { ros: any; name: string; messageType: string }) => ({
    ros: options.ros,
    name: options.name,
    messageType: options.messageType,
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    publish: vi.fn(),
  })),
  Service: vi.fn().mockImplementation((options: { ros: any; name: string; serviceType: string }) => ({
    ros: options.ros,
    name: options.name,
    serviceType: options.serviceType,
    callService: vi.fn(),
  })),
  ServiceRequest: vi.fn().mockImplementation((request: any) => request),
  Message: vi.fn().mockImplementation((message: any) => message),
};

// Mock roslib module
vi.mock('roslib', () => ({
  default: mockROSLIB,
}));

// Create mock connection
export const createMockConnection = (id: string = 'test-connection', overrides: Partial<RobotConnection> = {}): RobotConnection => {
  const mockRosInstance = new mockROSLIB.Ros({ url: 'ws://localhost:9090' });
  
  return {
    id,
    name: 'Test Robot',
    url: 'ws://localhost:9090',
    status: 'connected',
    rosInstance: mockRosInstance,
    subscriptions: [],
    ...overrides,
  };
};

// Create mock subscriptions
export const createMockSubscriptions = (): TopicSubscription[] => [
  {
    topicName: '/camera/image_raw',
    messageType: 'sensor_msgs/Image',
    lastMessage: null,
  },
  {
    topicName: '/scan',
    messageType: 'sensor_msgs/LaserScan',
    lastMessage: null,
  },
  {
    topicName: '/imu',
    messageType: 'sensor_msgs/Imu',
    lastMessage: null,
  },
  {
    topicName: '/cmd_vel',
    messageType: 'geometry_msgs/Twist',
    lastMessage: null,
  },
];

// Mock connection context value
export const createMockConnectionContext = (overrides: any = {}) => ({
  connections: {
    'test-connection': createMockConnection('test-connection'),
  },
  selectedConnectionId: 'test-connection',
  selectedConnection: createMockConnection('test-connection'),
  addConnection: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn(),
  reconnect: vi.fn(),
  removeConnection: vi.fn(),
  setSelectedConnectionId: vi.fn(),
  ...overrides,
});

// Mock service responses
export const mockServiceResponses = {
  topicsForType: {
    camera: { topics: ['/camera/image_raw', '/camera/compressed'] },
    laserScan: { topics: ['/scan', '/laser_scan'] },
    imu: { topics: ['/imu', '/imu_data'] },
    twist: { topics: ['/cmd_vel', '/mobile_base/commands/velocity'] },
  },
  getTopics: {
    topics: ['/camera/image_raw', '/scan', '/imu', '/cmd_vel'],
    types: ['sensor_msgs/Image', 'sensor_msgs/LaserScan', 'sensor_msgs/Imu', 'geometry_msgs/Twist'],
  },
};

// Setup ROS connection mocks
export const setupRosConnectionMocks = () => {
  // Setup ROSLIB.Ros mock
  mockROSLIB.Ros.mockImplementation((options) => {
    const eventHandlers: { [key: string]: Function[] } = {};
    
    return {
      url: options.url,
      socket: { binaryType: 'arraybuffer' },
      on: vi.fn().mockImplementation((event, callback) => {
        if (!eventHandlers[event]) {
          eventHandlers[event] = [];
        }
        eventHandlers[event].push(callback);
        
        // Immediately trigger connection event for successful connections
        if (event === 'connection' && !options.url.includes('invalid')) {
          // Use queueMicrotask for immediate but asynchronous execution
          queueMicrotask(() => callback());
        }
      }),
      close: vi.fn(),
      connect: vi.fn(),
      getTopics: vi.fn().mockImplementation((successCallback) => {
        queueMicrotask(() => successCallback(mockServiceResponses.getTopics));
      }),
      eventHandlers, // Expose for test access
    };
  });

  // Setup Service mock
  mockROSLIB.Service.mockImplementation((options) => ({
    ros: options.ros,
    name: options.name,
    serviceType: options.serviceType,
    callService: vi.fn().mockImplementation((request, callback) => {
      let response;
      if (request.type === 'sensor_msgs/Image') {
        response = mockServiceResponses.topicsForType.camera;
      } else if (request.type === 'sensor_msgs/LaserScan') {
        response = mockServiceResponses.topicsForType.laserScan;
      } else if (request.type === 'sensor_msgs/Imu') {
        response = mockServiceResponses.topicsForType.imu;
      } else if (request.type === 'geometry_msgs/Twist') {
        response = mockServiceResponses.topicsForType.twist;
      } else {
        response = { topics: [] };
      }
      queueMicrotask(() => callback(response));
    }),
  }));
};

// Cleanup ROS mocks
export const cleanupRosConnectionMocks = () => {
  vi.clearAllMocks();
};