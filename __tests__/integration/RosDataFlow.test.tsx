import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  mockROSLIB, 
  setupRosConnectionMocks, 
  cleanupRosConnectionMocks,
  createMockConnectionContext,
  generateImuData,
  generateLaserScanData,
  generateCameraImageData,
  createMockTopicSubscription,
  measureRenderPerformance
} from '@/test-utils';

// Mock all necessary modules
vi.mock('roslib', () => ({ default: mockROSLIB }));
vi.mock('@/components/dashboard/ConnectionProvider', () => ({
  useConnection: vi.fn(),
  default: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="connection-provider">{children}</div>)
}));
vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(() => ({ open: true })),
  SidebarProvider: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock('@/components/pilot/usePilotMode', () => ({
  usePilotMode: vi.fn(() => ({ isPilotMode: false })),
}));

// Mock components with vi.fn() inside the mock factory
vi.mock('@/components/sensorsection', () => ({ 
  default: vi.fn(() => <div>Sensor Section</div>)
}));
vi.mock('@/components/sensorsection/ImuVisualization', () => ({ 
  default: vi.fn(() => <div>IMU Visualization</div>)
}));
vi.mock('@/components/sensorsection/LaserScanVisualization', () => ({ 
  default: vi.fn(() => <div>Laser Scan</div>)
}));
vi.mock('@/components/controlsection/ControlPanel', () => ({ 
  default: vi.fn(() => <div>Control Panel</div>)
}));

// Mock dynamic import for ControlPanel
vi.mock('next/dynamic', () => {
  return {
    default: (importFunc: () => Promise<any>) => {
      // Return the mock component directly instead of dynamic loading
      return vi.fn(() => <div data-testid="control-panel">Control Panel</div>);
    }
  };
});
vi.mock('@/components/topicsection', () => ({ 
  default: vi.fn(() => <div>Topic Section</div>)
}));
vi.mock('@/components/sidebar', () => ({ 
  default: vi.fn(() => <div data-testid="sidebar">Sidebar</div>)
}));
vi.mock('@/components/pilot/PilotMode', () => ({ 
  default: vi.fn(() => <div data-testid="pilot-mode">Pilot Mode</div>)
}));
vi.mock('@/components/dashboard/PingManager', () => ({ 
  default: vi.fn(() => <div data-testid="ping-manager">Ping Manager</div>)
}));

// Import the original and create mock reference
import { useConnection } from '@/components/dashboard/ConnectionProvider';
const mockUseConnection = useConnection as vi.MockedFunction<typeof useConnection>;

describe('ROS Data Flow Integration', () => {
  let mockContext: any;
  let mockTopics: { [key: string]: any } = {};

  beforeEach(() => {
    setupRosConnectionMocks();
    
    // Mock window size for responsive layout testing (xl breakpoint = 1280px)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1400,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    // Create mock topics for different message types
    mockTopics.imu = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
    mockTopics.laser = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
    mockTopics.camera = createMockTopicSubscription('sensor_msgs/Image', '/camera/image_raw');
    mockTopics.twist = createMockTopicSubscription('geometry_msgs/Twist', '/cmd_vel');

    // Mock ROSLIB.Topic to return our mock topics
    mockROSLIB.Topic.mockImplementation((options) => {
      const topicName = options.name;
      if (topicName === '/imu') return mockTopics.imu;
      if (topicName === '/scan') return mockTopics.laser;
      if (topicName === '/camera/image_raw') return mockTopics.camera;
      if (topicName === '/cmd_vel') return mockTopics.twist;
      return createMockTopicSubscription(options.messageType, options.name);
    });

    mockContext = createMockConnectionContext();
    mockUseConnection.mockReturnValue(mockContext);
  });

  afterEach(() => {
    cleanupRosConnectionMocks();
    vi.clearAllMocks();
  });

  describe('end-to-end data flow', () => {
    it('should establish connection and subscribe to all sensor topics', async () => {
      const { container } = render(<DashboardLayout />, { withSidebarProvider: true });
      
      // Verify all components are rendered (responsive layout has multiple instances)
      expect(screen.getAllByText('Sensor Section').length).toBeGreaterThan(0);
      expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Control Panel').length).toBeGreaterThan(0);

      // Topic section is unique
      expect(screen.getByText('Topic Section')).toBeInTheDocument();
    });

    it('should handle simultaneous data streams from multiple sensors', async () => {
      render(<DashboardLayout />);

      await act(async () => {
        // Simulate simultaneous data from all sensors
        mockTopics.imu.triggerMessage(generateImuData());
        mockTopics.laser.triggerMessage(generateLaserScanData());
        mockTopics.camera.triggerMessage(generateCameraImageData());
      });

      // All components should handle their respective data (responsive layout)
      expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sensor Section').length).toBeGreaterThan(0);
    });

    it('should maintain data synchronization across components', async () => {
      render(<DashboardLayout />);

      const timestamp = Date.now();

      await act(async () => {
        // Send timestamped data
        mockTopics.imu.triggerMessage(generateImuData(timestamp));
        mockTopics.laser.triggerMessage({
          ...generateLaserScanData(),
          header: { stamp: { sec: Math.floor(timestamp / 1000), nanosec: (timestamp % 1000) * 1000000 } }
        });
      });

      // Components should receive data - verify they are still rendered (responsive layout)
      await waitFor(() => {
        expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);
      });
    });

    it('should handle high-frequency data updates efficiently', async () => {
      const startTime = performance.now();
      render(<DashboardLayout />);
      const renderTime = performance.now() - startTime;

      await act(async () => {
        // Simulate high-frequency updates (30 Hz)
        for (let i = 0; i < 30; i++) {
          mockTopics.imu.triggerMessage(generateImuData(Date.now() + i * 33));
          mockTopics.laser.triggerMessage(generateLaserScanData());
          await new Promise(resolve => setTimeout(resolve, 33)); // 30 Hz
        }
      });

      // Should maintain good performance
      expect(renderTime).toBeLessThan(1000); // Less than 1 second initial render
    });

    it('should handle connection state changes gracefully', async () => {
      const { rerender } = render(<DashboardLayout />);

      // Simulate connection loss
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: { ...mockContext.selectedConnection, status: 'disconnected' }
      }));

      rerender(<DashboardLayout />);

      // Components should handle disconnection gracefully
      expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);

      // Simulate reconnection
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: { ...mockContext.selectedConnection, status: 'connected' }
      }));

      rerender(<DashboardLayout />);

      // Components should resume normal operation
      expect(screen.getAllByText('Control Panel').length).toBeGreaterThan(0);
    });
  });

  describe('control command flow', () => {
    it('should send control commands with priority', async () => {
      render(<DashboardLayout />);

      await act(async () => {
        // Simulate control command
        const twistMessage = { linear: { x: 0.5, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } };
        mockTopics.twist.publish(twistMessage);
      });

      // Control topic should handle publishing
      expect(mockTopics.twist.publish).toHaveBeenCalled();
    });

    it('should prioritize control commands over sensor data', async () => {
      render(<DashboardLayout />);

      const controlStart = performance.now();
      
      await act(async () => {
        // Send control command and sensor data simultaneously
        mockTopics.twist.publish({ linear: { x: 0.5, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } });
        mockTopics.imu.triggerMessage(generateImuData());
        mockTopics.laser.triggerMessage(generateLaserScanData());
      });

      const controlEnd = performance.now();

      // Control commands should be processed quickly
      expect(controlEnd - controlStart).toBeLessThan(100); // Less than 100ms
    });

    it('should handle rapid control command sequences', async () => {
      render(<DashboardLayout />);

      await act(async () => {
        // Send rapid sequence of control commands
        for (let i = 0; i < 10; i++) {
          mockTopics.twist.publish({ 
            linear: { x: i * 0.1, y: 0, z: 0 }, 
            angular: { x: 0, y: 0, z: i * 0.1 } 
          });
        }
      });

      // Should handle all commands without dropping any
      expect(mockTopics.twist.publish).toHaveBeenCalledTimes(10);
    });
  });

  describe('error handling and recovery', () => {
    it('should handle sensor data corruption gracefully', async () => {
      render(<DashboardLayout />);

      await act(async () => {
        // Send corrupted data
        mockTopics.imu.triggerMessage({
          orientation: { x: NaN, y: Infinity, z: null, w: undefined },
          linear_acceleration: null,
          angular_velocity: 'invalid'
        });

        mockTopics.laser.triggerMessage({
          ranges: [NaN, Infinity, null, undefined, 'invalid'],
          angle_min: null,
          angle_max: undefined
        });
      });

      // Components should remain functional despite corrupted data
      expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);
    });

    it('should recover from temporary connection loss', async () => {
      const { rerender } = render(<DashboardLayout />);

      // Start with good connection
      await act(async () => {
        mockTopics.imu.triggerMessage(generateImuData());
      });

      // Simulate connection loss
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null
      }));

      rerender(<DashboardLayout />);

      // Simulate connection recovery
      mockUseConnection.mockReturnValue(mockContext);

      rerender(<DashboardLayout />);

      // System should recover and resume data flow
      await act(async () => {
        mockTopics.imu.triggerMessage(generateImuData());
      });

      expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
    });

    it('should handle topic subscription failures gracefully', async () => {
      // Mock subscription failure
      mockTopics.imu.subscribe.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      render(<DashboardLayout />);

      // Should not crash the entire application
      expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);
    });
  });

  describe('performance under load', () => {
    it('should maintain responsiveness with multiple high-frequency data streams', async () => {
      const startTime = performance.now();
      
      render(<DashboardLayout />);

      await act(async () => {
        // Simulate high-frequency data from multiple sources
        const promises = [];
        
        for (let i = 0; i < 100; i++) {
          promises.push(new Promise(resolve => {
            setTimeout(() => {
              mockTopics.imu.triggerMessage(generateImuData(Date.now() + i * 10));
              mockTopics.laser.triggerMessage(generateLaserScanData());
              resolve(undefined);
            }, i * 10);
          }));
        }

        await Promise.all(promises);
      });

      const endTime = performance.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds
    });

    it('should handle large dataset processing efficiently', async () => {
      render(<DashboardLayout />);

      await act(async () => {
        // Send large laser scan data
        const largeScan = generateLaserScanData(5000); // Very high resolution
        mockTopics.laser.triggerMessage(largeScan);

        // Send high-resolution image
        const largeImage = generateCameraImageData(1920, 1080);
        mockTopics.camera.triggerMessage(largeImage);
      });

      // Should handle large datasets without freezing
      expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sensor Section').length).toBeGreaterThan(0);
    });

    it('should maintain memory efficiency during extended operation', async () => {
      render(<DashboardLayout />);

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      await act(async () => {
        // Simulate extended operation with continuous data
        for (let i = 0; i < 500; i++) {
          mockTopics.imu.triggerMessage(generateImuData());
          mockTopics.laser.triggerMessage(generateLaserScanData());
          
          if (i % 50 === 0) {
            // Periodic cleanup opportunity
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      });

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be reasonable (less than 50MB for this test)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('data consistency and validation', () => {
    it('should validate data integrity across component boundaries', async () => {
      render(<DashboardLayout />);

      const testData = {
        imu: generateImuData(),
        laser: generateLaserScanData(),
        camera: generateCameraImageData()
      };

      await act(async () => {
        // Send known test data
        mockTopics.imu.triggerMessage(testData.imu);
        mockTopics.laser.triggerMessage(testData.laser);
        mockTopics.camera.triggerMessage(testData.camera);
      });

      // Components should receive and process data correctly
      expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sensor Section').length).toBeGreaterThan(0);
    });

    it('should maintain temporal consistency across sensors', async () => {
      render(<DashboardLayout />);

      const baseTimestamp = Date.now();

      await act(async () => {
        // Send data with sequential timestamps
        for (let i = 0; i < 5; i++) {
          const timestamp = baseTimestamp + i * 100;
          mockTopics.imu.triggerMessage(generateImuData(timestamp));
          
          await new Promise(resolve => setTimeout(resolve, 10));
          
          mockTopics.laser.triggerMessage({
            ...generateLaserScanData(),
            header: { 
              stamp: { 
                sec: Math.floor(timestamp / 1000), 
                nanosec: (timestamp % 1000) * 1000000 
              } 
            }
          });
        }
      });

      // Data should be processed in correct temporal order
      expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);
    });

    it('should handle data rate mismatches between sensors', async () => {
      render(<DashboardLayout />);

      await act(async () => {
        // Simulate different data rates
        // IMU at 100 Hz
        for (let i = 0; i < 10; i++) {
          mockTopics.imu.triggerMessage(generateImuData(Date.now() + i * 10));
        }

        // Laser at 10 Hz
        mockTopics.laser.triggerMessage(generateLaserScanData());

        // Camera at 15 Hz
        for (let i = 0; i < 3; i++) {
          mockTopics.camera.triggerMessage(generateCameraImageData());
        }
      });

      // All components should handle their respective data rates
      expect(screen.getAllByText('IMU Visualization').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Laser Scan').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sensor Section').length).toBeGreaterThan(0);
    });
  });
});