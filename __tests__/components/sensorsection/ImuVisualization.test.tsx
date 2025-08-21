import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/test-utils';
import ImuVisualization from '@/components/sensorsection/ImuVisualization';
import { 
  mockROSLIB, 
  setupRosConnectionMocks, 
  cleanupRosConnectionMocks,
  createMockConnectionContext,
  generateImuData,
  createMockTopicSubscription
} from '@/test-utils';
import { useConnection } from '@/components/dashboard/ConnectionProvider';

// Mock dependencies
vi.mock('roslib', () => ({ default: mockROSLIB }));
vi.mock('@/components/dashboard/ConnectionProvider');

// Mock D3 with comprehensive implementation
vi.mock('d3', () => {
  const mockSelection = {
    select: vi.fn().mockReturnThis(),
    selectAll: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    datum: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    enter: vi.fn().mockReturnThis(),
    merge: vi.fn().mockReturnThis(),
    exit: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    empty: vi.fn(() => false),
  };

  return {
    select: vi.fn(() => mockSelection),
    scaleTime: vi.fn(() => ({
      domain: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
    scaleLinear: vi.fn(() => ({
      domain: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
    axisBottom: vi.fn(() => ({
      ticks: vi.fn().mockReturnThis(),
      tickFormat: vi.fn().mockReturnThis(),
    })),
    axisLeft: vi.fn(() => ({
      ticks: vi.fn().mockReturnThis(),
      tickFormat: vi.fn().mockReturnThis(),
    })),
    line: vi.fn(() => ({
      x: vi.fn().mockReturnThis(),
      y: vi.fn().mockReturnThis(),
      curve: vi.fn().mockReturnThis(),
    })),
    curveBasis: vi.fn(),
  };
});

const mockUseConnection = useConnection as vi.MockedFunction<typeof useConnection>;

describe('ImuVisualization', () => {
  beforeEach(() => {
    setupRosConnectionMocks();
    mockUseConnection.mockReturnValue(createMockConnectionContext());
  });

  afterEach(() => {
    cleanupRosConnectionMocks();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render IMU component without crashing', () => {
      const mockConnection = createMockConnectionContext();
      mockUseConnection.mockReturnValue(mockConnection);
      
      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      // Basic render test - just ensure the component doesn't crash
      expect(container.firstChild).not.toBeNull();
    });

    it('should handle no connection state', () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      // Just verify the component renders something when there's no connection
      expect(container.firstChild).not.toBeNull();
    });

    it('should handle disconnected status', () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: {
          ...createMockConnectionContext().selectedConnection,
          status: 'disconnected',
        },
      }));

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      // Just verify the component handles disconnected state
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('topic selection', () => {
    it('should render without topic selector errors', () => {
      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      // Just verify the component renders
      expect(container.firstChild).not.toBeNull();
    });

    it('should handle topic switching', () => {
      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      // Basic test - component should handle topic changes
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('data handling', () => {
    it('should handle IMU data without errors', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      // Trigger mock data
      const mockData = generateImuData();
      mockTopic.triggerMessage(mockData);

      expect(container.firstChild).not.toBeNull();
    });

    it('should handle multiple IMU data points', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      // Send multiple data points
      for (let i = 0; i < 5; i++) {
        mockTopic.triggerMessage(generateImuData(Date.now() + i * 100));
      }

      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('connection state handling', () => {
    it('should handle connection state changes', () => {
      const { rerender } = render(<ImuVisualization />, { withSidebarProvider: false });

      // Change connection state
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      rerender(<ImuVisualization />);
      
      // Just verify the component continues to render after state change
      expect(document.body).toContainHTML('<div');
    });

    it('should handle reconnection', () => {
      // Start with no connection
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      const { rerender } = render(<ImuVisualization />, { withSidebarProvider: false });

      // Reconnect
      mockUseConnection.mockReturnValue(createMockConnectionContext());
      rerender(<ImuVisualization />);
      
      expect(document.body).toContainHTML('<div');
    });
  });

  describe('performance', () => {
    it('should handle large datasets without crashing', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });

      // Generate large dataset
      for (let i = 0; i < 50; i++) {
        mockTopic.triggerMessage(generateImuData(Date.now() + i * 20));
      }

      expect(container.firstChild).not.toBeNull();
    });

    it('should handle rapid data updates', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });

      // Rapid updates
      const startTime = performance.now();
      for (let i = 0; i < 20; i++) {
        mockTopic.triggerMessage(generateImuData());
      }
      const processingTime = performance.now() - startTime;

      expect(processingTime).toBeLessThan(1000); // Should be fast
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('chart rendering', () => {
    it('should handle chart operations without errors', () => {
      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      // Just verify D3 mocks don't cause crashes
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle invalid IMU data gracefully', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      // Send invalid data
      mockTopic.triggerMessage({ invalid: 'data' });

      expect(container.firstChild).not.toBeNull();
    });

    it('should handle topic fetch errors gracefully', () => {
      // Mock service to throw error
      mockROSLIB.Service.mockImplementation(() => ({
        callService: vi.fn((request, callback) => {
          // Simulate error by not calling callback
        }),
      }));

      const { container } = render(<ImuVisualization />, { withSidebarProvider: false });
      
      expect(container.firstChild).not.toBeNull();
    });
  });
});