import { vi } from 'vitest';

// IMU Data Generators
export const generateImuData = (timestamp: number = Date.now()) => ({
  header: {
    stamp: { sec: Math.floor(timestamp / 1000), nanosec: (timestamp % 1000) * 1000000 },
    frame_id: 'imu_link',
  },
  orientation: {
    x: Math.random() * 0.1 - 0.05,
    y: Math.random() * 0.1 - 0.05,
    z: Math.random() * 0.1 - 0.05,
    w: 0.9 + Math.random() * 0.1,
  },
  orientation_covariance: new Array(9).fill(0),
  angular_velocity: {
    x: Math.random() * 0.2 - 0.1,
    y: Math.random() * 0.2 - 0.1,
    z: Math.random() * 0.2 - 0.1,
  },
  angular_velocity_covariance: new Array(9).fill(0),
  linear_acceleration: {
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: 9.81 + Math.random() * 0.5 - 0.25,
  },
  linear_acceleration_covariance: new Array(9).fill(0),
});

// Laser Scan Data Generator
export const generateLaserScanData = (numPoints: number = 360) => {
  const angleMin = -Math.PI;
  const angleMax = Math.PI;
  const angleIncrement = (angleMax - angleMin) / numPoints;
  const rangeMin = 0.1;
  const rangeMax = 10.0;
  
  const ranges = Array.from({ length: numPoints }, (_, i) => {
    // Create some realistic obstacles
    const angle = angleMin + i * angleIncrement;
    let range = rangeMax;
    
    // Add some walls and obstacles
    if (Math.abs(angle) < 0.5) {
      range = 3.0 + Math.random() * 0.5; // Front wall
    } else if (angle > 1.5 || angle < -1.5) {
      range = 2.0 + Math.random() * 0.3; // Side walls
    } else if (Math.random() < 0.1) {
      range = 1.0 + Math.random() * 2.0; // Random obstacles
    }
    
    // Add some noise
    range += (Math.random() - 0.5) * 0.1;
    
    return Math.max(rangeMin, Math.min(rangeMax, range));
  });

  return {
    header: {
      stamp: { sec: Math.floor(Date.now() / 1000), nanosec: (Date.now() % 1000) * 1000000 },
      frame_id: 'base_laser',
    },
    angle_min: angleMin,
    angle_max: angleMax,
    angle_increment: angleIncrement,
    time_increment: 0.0,
    scan_time: 0.1,
    range_min: rangeMin,
    range_max: rangeMax,
    ranges,
    intensities: new Array(numPoints).fill(0),
  };
};

// Camera Image Data Generator
export const generateCameraImageData = (width: number = 640, height: number = 480) => {
  // Create a simple test pattern
  const dataLength = width * height * 3; // RGB
  const data = new Uint8Array(dataLength);
  
  for (let i = 0; i < dataLength; i += 3) {
    const pixelIndex = Math.floor(i / 3);
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    
    // Create a simple gradient pattern
    data[i] = (x / width) * 255;     // Red
    data[i + 1] = (y / height) * 255; // Green
    data[i + 2] = 128;                // Blue
  }

  return {
    header: {
      stamp: { sec: Math.floor(Date.now() / 1000), nanosec: (Date.now() % 1000) * 1000000 },
      frame_id: 'camera',
    },
    height,
    width,
    encoding: 'rgb8',
    is_bigendian: false,
    step: width * 3,
    data: Array.from(data),
  };
};

// Twist Message Generator
export const generateTwistData = (linear: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }, 
                                  angular: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }) => ({
  linear,
  angular,
});

// Mock topic subscription with realistic data
export const createMockTopicSubscription = (messageType: string, topicName: string) => {
  let subscribeCallback: ((message: any) => void) | null = null;
  let intervalId: NodeJS.Timeout | null = null;

  const mockTopic = {
    ros: {},
    name: topicName,
    messageType,
    subscribe: vi.fn().mockImplementation((callback: (message: any) => void) => {
      subscribeCallback = callback;
      
      // Start publishing mock data at regular intervals
      intervalId = setInterval(() => {
        if (subscribeCallback) {
          let message;
          switch (messageType) {
            case 'sensor_msgs/Imu':
              message = generateImuData();
              break;
            case 'sensor_msgs/LaserScan':
              message = generateLaserScanData();
              break;
            case 'sensor_msgs/Image':
              message = generateCameraImageData();
              break;
            case 'geometry_msgs/Twist':
              message = generateTwistData();
              break;
            default:
              message = {};
          }
          subscribeCallback(message);
        }
      }, 100); // 10 Hz
    }),
    unsubscribe: vi.fn().mockImplementation(() => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      subscribeCallback = null;
    }),
    publish: vi.fn(),
    // Helper method to manually trigger a message
    triggerMessage: (message?: any) => {
      if (subscribeCallback) {
        const msg = message || (() => {
          switch (messageType) {
            case 'sensor_msgs/Imu':
              return generateImuData();
            case 'sensor_msgs/LaserScan':
              return generateLaserScanData();
            case 'sensor_msgs/Image':
              return generateCameraImageData();
            case 'geometry_msgs/Twist':
              return generateTwistData();
            default:
              return {};
          }
        })();
        subscribeCallback(msg);
      }
    },
  };

  return mockTopic;
};

// Performance testing data generators
export const generateLargeDataset = {
  imu: (count: number) => Array.from({ length: count }, () => generateImuData()),
  laserScan: (pointCount: number = 1080) => generateLaserScanData(pointCount),
  highResolutionImage: () => generateCameraImageData(1920, 1080),
};

// Stress testing scenarios
export const stressTestScenarios = {
  highFrequencyUpdates: (messageType: string, frequency: number = 60) => {
    const topic = createMockTopicSubscription(messageType, '/stress_test');
    
    // Override the interval for high frequency
    const originalSubscribe = topic.subscribe;
    topic.subscribe = vi.fn().mockImplementation((callback) => {
      const intervalTime = 1000 / frequency;
      setInterval(() => {
        topic.triggerMessage();
      }, intervalTime);
      return originalSubscribe(callback);
    });
    
    return topic;
  },
  
  memoryLeakTest: (messageType: string, messageCount: number = 1000) => {
    const topic = createMockTopicSubscription(messageType, '/memory_test');
    
    // Generate large amounts of data
    for (let i = 0; i < messageCount; i++) {
      setTimeout(() => topic.triggerMessage(), i * 10);
    }
    
    return topic;
  },
};

// Realistic sensor noise and edge cases
export const edgeCaseData = {
  imuWithNoise: () => ({
    ...generateImuData(),
    linear_acceleration: {
      x: (Math.random() - 0.5) * 20, // High acceleration
      y: (Math.random() - 0.5) * 20,
      z: 9.81 + (Math.random() - 0.5) * 5,
    },
    angular_velocity: {
      x: (Math.random() - 0.5) * 10, // High angular velocity
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
    },
  }),
  
  laserScanWithOcclusions: () => {
    const scan = generateLaserScanData();
    // Add some infinite/NaN values to simulate occlusions
    for (let i = 0; i < scan.ranges.length; i += 10) {
      if (Math.random() < 0.3) {
        scan.ranges[i] = Infinity;
      }
      if (Math.random() < 0.1) {
        scan.ranges[i] = NaN;
      }
    }
    return scan;
  },
  
  corruptedImage: () => {
    const image = generateCameraImageData();
    // Corrupt some data
    for (let i = 0; i < image.data.length; i += 100) {
      image.data[i] = Math.random() * 256;
    }
    return image;
  },
};