import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@/test-utils';
import { 
  measureRenderPerformance,
  testVisualizationPerformance,
  detectMemoryLeaks,
  testD3Performance,
  assertPerformance,
  runPerformanceBenchmark,
  generateImuData,
  generateLaserScanData,
  createMockTopicSubscription
} from '@/test-utils';
import ImuVisualization from '@/components/sensorsection/ImuVisualization';
import LaserScanVisualization from '@/components/sensorsection/LaserScanVisualization';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import { createMockConnectionContext, mockROSLIB } from '@/test-utils';

// Mock dependencies
vi.mock('@/components/dashboard/ConnectionProvider');
vi.mock('roslib', () => ({ default: mockROSLIB }));
vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(() => ({ open: true })),
}));

// Mock child components for performance testing
vi.mock('@/components/sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('@/components/sensorsection', () => ({
  default: () => <div data-testid="sensor-section">Sensor Section</div>,
}));
vi.mock('@/components/topicsection', () => ({
  default: () => <div data-testid="topic-section">Topic Section</div>,
}));
vi.mock('@/components/controlsection/ControlPanel', () => ({
  default: () => <div data-testid="control-panel">Control Panel</div>,
}));

const mockUseConnection = useConnection as vi.MockedFunction<typeof useConnection>;

describe('Visualization Performance Tests', () => {
  beforeEach(() => {
    mockUseConnection.mockReturnValue(createMockConnectionContext());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('IMU Visualization Performance', () => {
    it('should render IMU component within performance thresholds', async () => {
      const metrics = await measureRenderPerformance(() => render(<ImuVisualization />));

      assertPerformance(metrics, {
        renderTime: 500, // 500ms max render time
        memoryUsage: 5 * 1024 * 1024, // 5MB max memory usage
      });
    });

    it('should handle high-frequency IMU data efficiently', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const metrics = await testVisualizationPerformance(
        () => render(<ImuVisualization />),
        () => generateImuData(),
        {
          frequency: 50, // 50 Hz
          duration: 2, // 2 seconds
          dataPoints: 1,
        }
      );

      assertPerformance(metrics, {
        updateTime: 20, // Max 20ms per update
        reRenderCount: 100, // 50Hz * 2s = 100 updates
      });
    });

    it('should maintain performance with large IMU data history', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      const startTime = performance.now();

      // Send 2000 data points rapidly
      for (let i = 0; i < 2000; i++) {
        mockTopic.triggerMessage(generateImuData(Date.now() + i * 10));
      }

      const processingTime = performance.now() - startTime;

      expect(processingTime).toBeLessThan(5000); // Should process 2000 points in under 5 seconds
    });

    it('should not have memory leaks with continuous data', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const leakResults = await detectMemoryLeaks(
        () => {
          const rendered = render(<ImuVisualization />);
          
          // Simulate data flow
          for (let i = 0; i < 50; i++) {
            mockTopic.triggerMessage(generateImuData());
          }
          
          return rendered;
        },
        50 // 50 iterations
      );

      expect(leakResults.leaked).toBe(false);
      expect(leakResults.averageRenderTime).toBeLessThan(100); // 100ms average
    });

    it('should handle chart rendering performance', async () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      document.body.appendChild(svgElement);

      const metrics = await testD3Performance(
        svgElement,
        1000, // 1000 data points
        ['render', 'update', 'transition']
      );

      assertPerformance(metrics, {
        renderTime: 1000, // 1 second for complex chart operations
        updateTime: 300, // 300ms average per operation
      });

      document.body.removeChild(svgElement);
    });
  });

  describe('LaserScan Visualization Performance', () => {
    it('should render LaserScan component efficiently', async () => {
      const metrics = await measureRenderPerformance(() => render(<LaserScanVisualization />));

      assertPerformance(metrics, {
        renderTime: 800, // 800ms max render time (more complex than IMU)
        memoryUsage: 10 * 1024 * 1024, // 10MB max memory usage
      });
    });

    it('should handle high-resolution laser scans', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      const startTime = performance.now();

      // Send high-resolution scan data
      const highResScan = generateLaserScanData(1080); // 1080 points
      mockTopic.triggerMessage(highResScan);

      const processingTime = performance.now() - startTime;

      expect(processingTime).toBeLessThan(200); // Should process 1080 points in under 200ms
    });

    it('should maintain performance with rapid scan updates', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const metrics = await testVisualizationPerformance(
        () => render(<LaserScanVisualization />),
        () => generateLaserScanData(360),
        {
          frequency: 10, // 10 Hz (typical LiDAR frequency)
          duration: 3, // 3 seconds
          dataPoints: 360,
        }
      );

      assertPerformance(metrics, {
        updateTime: 100, // Max 100ms per update
        reRenderCount: 30, // 10Hz * 3s = 30 updates
      });
    });

    it('should efficiently filter invalid laser scan points', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      const startTime = performance.now();

      // Create scan with many invalid points
      const corruptedScan = {
        ...generateLaserScanData(1000),
        ranges: Array.from({ length: 1000 }, () => 
          Math.random() < 0.3 ? NaN : 
          Math.random() < 0.3 ? Infinity : 
          Math.random() < 0.3 ? -1 : 
          Math.random() * 10
        ),
      };

      mockTopic.triggerMessage(corruptedScan);

      const filteringTime = performance.now() - startTime;

      expect(filteringTime).toBeLessThan(50); // Should filter 1000 points in under 50ms
    });

    it('should handle coordinate transformation efficiently', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      const startTime = performance.now();

      // Send multiple scans with different geometries
      for (let i = 0; i < 20; i++) {
        const scan = {
          ...generateLaserScanData(500),
          angle_min: -Math.PI + (i * 0.1),
          angle_max: Math.PI - (i * 0.1),
        };
        mockTopic.triggerMessage(scan);
      }

      const transformTime = performance.now() - startTime;

      expect(transformTime).toBeLessThan(1000); // 20 transformations in under 1 second
    });
  });

  describe('Dashboard Layout Performance', () => {
    it('should render dashboard within performance thresholds', async () => {
      const metrics = await measureRenderPerformance(() => render(<DashboardLayout />));

      assertPerformance(metrics, {
        renderTime: 1000, // 1 second max for full dashboard
        memoryUsage: 20 * 1024 * 1024, // 20MB max memory usage
      });
    });

    it('should handle responsive layout changes efficiently', async () => {
      const { container } = render(<DashboardLayout />);

      const startTime = performance.now();

      // Simulate multiple viewport changes
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
        { width: 1440, height: 900 },
      ];

      viewports.forEach(viewport => {
        // Mock container resize
        Object.defineProperty(container, 'clientWidth', {
          value: viewport.width,
          configurable: true,
        });
        Object.defineProperty(container, 'clientHeight', {
          value: viewport.height,
          configurable: true,
        });

        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
      });

      const layoutTime = performance.now() - startTime;

      expect(layoutTime).toBeLessThan(200); // All layout changes in under 200ms
    });

    it('should maintain performance with concurrent data streams', async () => {
      const mockTopics = {
        imu: createMockTopicSubscription('sensor_msgs/Imu', '/imu'),
        laser: createMockTopicSubscription('sensor_msgs/LaserScan', '/scan'),
      };

      mockROSLIB.Topic.mockImplementation((options) => {
        if (options.name === '/imu') return mockTopics.imu;
        if (options.name === '/scan') return mockTopics.laser;
        return createMockTopicSubscription(options.messageType, options.name);
      });

      render(<DashboardLayout />);

      const startTime = performance.now();

      // Simulate concurrent data from multiple sensors
      for (let i = 0; i < 100; i++) {
        mockTopics.imu.triggerMessage(generateImuData());
        mockTopics.laser.triggerMessage(generateLaserScanData());
      }

      const concurrentTime = performance.now() - startTime;

      expect(concurrentTime).toBeLessThan(2000); // Handle 200 messages in under 2 seconds
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet IMU rendering benchmarks', async () => {
      const results = await runPerformanceBenchmark(
        'IMU Visualization Rendering',
        async () => {
          return await measureRenderPerformance(() => render(<ImuVisualization />));
        },
        {
          renderTime: 300,
          memoryUsage: 5 * 1024 * 1024,
        },
        5 // 5 iterations
      );

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result.renderTime).toBeLessThan(500);
      });
    });

    it('should meet LaserScan processing benchmarks', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const results = await runPerformanceBenchmark(
        'LaserScan Data Processing',
        async () => {
          render(<LaserScanVisualization />);
          
          const startTime = performance.now();
          mockTopic.triggerMessage(generateLaserScanData(720));
          const processingTime = performance.now() - startTime;

          return {
            renderTime: processingTime,
            updateTime: processingTime,
            memoryUsage: 0,
            reRenderCount: 1,
          };
        },
        {
          renderTime: 100,
          updateTime: 100,
        },
        3 // 3 iterations
      );

      expect(results.length).toBe(3);
    });

    it('should meet dashboard responsiveness benchmarks', async () => {
      const results = await runPerformanceBenchmark(
        'Dashboard Responsiveness',
        async () => {
          const startTime = performance.now();
          const { rerender } = render(<DashboardLayout />);
          
          // Simulate prop changes
          rerender(<DashboardLayout />);
          
          const responseTime = performance.now() - startTime;

          return {
            renderTime: responseTime,
            updateTime: responseTime,
            memoryUsage: 0,
            reRenderCount: 1,
          };
        },
        {
          renderTime: 200,
          updateTime: 200,
        },
        5 // 5 iterations
      );

      expect(results.length).toBe(5);
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory during extended operation', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const leakResults = await detectMemoryLeaks(
        () => {
          const rendered = render(<ImuVisualization />);
          
          // Simulate extended operation
          for (let i = 0; i < 200; i++) {
            mockTopic.triggerMessage(generateImuData());
          }
          
          return rendered;
        },
        20 // 20 iterations
      );

      expect(leakResults.leaked).toBe(false);
      expect(leakResults.memoryGrowth).toBeLessThan(1024 * 1024); // Less than 1MB growth
    });

    it('should clean up event listeners properly', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      // Track subscribe/unsubscribe calls
      let subscribeCount = 0;
      let unsubscribeCount = 0;

      const originalSubscribe = mockTopic.subscribe;
      const originalUnsubscribe = mockTopic.unsubscribe;

      mockTopic.subscribe = vi.fn(() => {
        subscribeCount++;
        originalSubscribe();
      });

      mockTopic.unsubscribe = vi.fn(() => {
        unsubscribeCount++;
        originalUnsubscribe();
      });

      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<ImuVisualization />);
        unmount();
      }

      expect(subscribeCount).toBe(unsubscribeCount);
    });

    it('should handle garbage collection efficiently', async () => {
      if (global.gc) {
        const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

        // Create and destroy many components
        for (let i = 0; i < 50; i++) {
          const { unmount } = render(<ImuVisualization />);
          unmount();
        }

        // Force garbage collection
        global.gc();

        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryGrowth = finalMemory - initialMemory;

        expect(memoryGrowth).toBeLessThan(2 * 1024 * 1024); // Less than 2MB growth
      }
    });
  });
});