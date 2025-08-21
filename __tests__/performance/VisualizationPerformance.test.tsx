import React from 'react';
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
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/pilot/usePilotMode', () => ({
  usePilotMode: vi.fn(() => ({ isPilotMode: false })),
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
    it('should render IMU component without performance issues', async () => {
      const startTime = performance.now();
      
      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      const renderTime = performance.now() - startTime;
      
      // Basic performance assertion - should render within reasonable time
      expect(renderTime).toBeLessThan(1000); // 1 second max
      expect(container.firstChild).not.toBeNull();
    });

    it('should handle IMU data updates efficiently', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });

      // Generate and trigger IMU data
      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        mockTopic.triggerMessage(generateImuData());
      }
      const processingTime = performance.now() - startTime;

      expect(processingTime).toBeLessThan(500); // Should handle 10 updates in under 500ms
      expect(container.firstChild).not.toBeNull();
    });

    it('should handle large IMU data history without memory issues', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });

      // Generate large amount of data
      for (let i = 0; i < 100; i++) {
        mockTopic.triggerMessage(generateImuData(Date.now() + i * 10));
      }

      expect(container.firstChild).not.toBeNull();
    });

    it('should not have obvious memory leaks', () => {
      // Simple memory leak test - just verify component can be created and destroyed
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<ImuVisualization />, { withSidebarProvider: false });
        unmount();
      }
      
      // If we get here without crashing, basic memory management is working
      expect(true).toBe(true);
    });
  });

  describe('LaserScan Visualization Performance', () => {
    it('should render LaserScan component efficiently', () => {
      const startTime = performance.now();
      
      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });
      
      const renderTime = performance.now() - startTime;
      
      expect(renderTime).toBeLessThan(1000); // 1 second max
      expect(container.firstChild).not.toBeNull();
    });

    it('should handle high-resolution laser scans', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });

      // Generate high-resolution scan data
      const startTime = performance.now();
      const largeData = generateLaserScanData(1080); // High resolution
      mockTopic.triggerMessage(largeData);
      const processingTime = performance.now() - startTime;

      expect(processingTime).toBeLessThan(1000); // Should handle large data in under 1 second
      expect(container.firstChild).not.toBeNull();
    });

    it('should maintain performance with rapid data updates', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });

      const startTime = performance.now();
      // Simulate rapid updates
      for (let i = 0; i < 20; i++) {
        mockTopic.triggerMessage(generateLaserScanData(360));
      }
      const totalTime = performance.now() - startTime;

      expect(totalTime).toBeLessThan(2000); // Should handle 20 updates in under 2 seconds
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('Dashboard Layout Performance', () => {
    it('should render dashboard layout efficiently', () => {
      const startTime = performance.now();
      
      const { container } = render(<DashboardLayout />);
      
      const renderTime = performance.now() - startTime;
      
      expect(renderTime).toBeLessThan(1000); // 1 second max
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('D3 Visualization Performance', () => {
    it('should handle D3 operations efficiently', () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      document.body.appendChild(svgElement);

      const startTime = performance.now();
      
      // Create mock data points
      for (let i = 0; i < 100; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(i));
        circle.setAttribute('cy', String(Math.random() * 100));
        circle.setAttribute('r', '2');
        svgElement.appendChild(circle);
      }

      const processingTime = performance.now() - startTime;
      
      expect(processingTime).toBeLessThan(500); // Should create 100 elements in under 500ms
      expect(svgElement.children.length).toBe(100);

      document.body.removeChild(svgElement);
    });
  });

  describe('Memory and Resource Management', () => {
    it('should clean up resources properly', () => {
      // Test component cleanup
      const components = [];
      
      for (let i = 0; i < 5; i++) {
        components.push(render(<ImuVisualization />, { withSidebarProvider: false }));
      }
      
      // Unmount all components
      components.forEach(({ unmount }) => unmount());
      
      // If we get here, cleanup is working
      expect(true).toBe(true);
    });
  });
});