import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/test-utils';
import LaserScanVisualization from '@/components/sensorsection/LaserScanVisualization';
import { 
  mockROSLIB, 
  setupRosConnectionMocks, 
  cleanupRosConnectionMocks,
  createMockConnectionContext,
  generateLaserScanData,
  createMockTopicSubscription
} from '@/test-utils';
import { useConnection } from '@/components/dashboard/ConnectionProvider';

// Mock dependencies
vi.mock('roslib', () => ({ default: mockROSLIB }));
vi.mock('@/components/dashboard/ConnectionProvider');
vi.mock('@/components/pilot/usePilotMode', () => ({
  usePilotMode: vi.fn(() => ({ isPilotMode: false })),
}));

// Mock D3 with more complete implementation
vi.mock('d3', () => {
  const mockSelection = {
    select: vi.fn().mockReturnThis(),
    selectAll: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    enter: vi.fn().mockReturnThis(),
    merge: vi.fn().mockReturnThis(),
    exit: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    empty: vi.fn(() => false),
  };

  return {
    select: vi.fn(() => mockSelection),
    scaleLinear: vi.fn(() => ({
      domain: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      ticks: vi.fn(() => [0, 1, 2, 3, 4, 5]),
    })),
    axisBottom: vi.fn(() => ({
      ticks: vi.fn().mockReturnThis(),
    })),
    axisLeft: vi.fn(() => ({
      ticks: vi.fn().mockReturnThis(),
    })),
  };
});

const mockUseConnection = useConnection as vi.MockedFunction<typeof useConnection>;

describe('LaserScanVisualization', () => {
  beforeEach(() => {
    setupRosConnectionMocks();
    mockUseConnection.mockReturnValue(createMockConnectionContext());
  });

  afterEach(() => {
    cleanupRosConnectionMocks();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render LiDAR component without crashing', () => {
      const mockConnection = createMockConnectionContext();
      mockUseConnection.mockReturnValue(mockConnection);
      
      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });
      
      // Basic render test - just ensure the component doesn't crash
      expect(container.firstChild).not.toBeNull();
    });

    it('should handle no connection state', () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });
      
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

      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });
      
      // Just verify the component handles disconnected state
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('topic selection', () => {
    it('should render without topic selector errors', () => {
      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });
      
      // Just verify the component renders
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('data handling', () => {
    it('should handle laser scan data without errors', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });
      
      // Trigger mock data
      const mockData = generateLaserScanData(360);
      mockTopic.triggerMessage(mockData);

      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('connection state handling', () => {
    it('should handle connection state changes', () => {
      const { rerender } = render(<LaserScanVisualization />, { withSidebarProvider: false });

      // Change connection state
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      rerender(<LaserScanVisualization />);
      
      // Just verify the component continues to render after state change
      expect(document.body).toContainHTML('<div');
    });
  });

  describe('performance', () => {
    it('should handle large datasets without crashing', () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });

      // Generate large dataset
      const largeData = generateLaserScanData(1080); // High resolution scan
      mockTopic.triggerMessage(largeData);

      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('visualization features', () => {
    it('should handle D3 operations without errors', () => {
      const { container } = render(<LaserScanVisualization />, { withSidebarProvider: false });
      
      // Just verify D3 mocks don't cause crashes
      expect(container.firstChild).not.toBeNull();
    });
  });
});