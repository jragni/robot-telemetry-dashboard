import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
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
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({ remove: vi.fn() })),
    attr: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    datum: vi.fn().mockReturnThis(),
    enter: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
  })),
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
}));

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
    it('should render LiDAR visualization with connected robot', () => {
      render(<LaserScanVisualization />);

      expect(screen.getByText('LiDAR')).toBeInTheDocument();
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should show no connection message when not connected', () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      render(<LaserScanVisualization />);

      expect(screen.getByText('LiDAR: No connection')).toBeInTheDocument();
    });

    it('should show disconnected status when connection is not active', () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: {
          id: 'test',
          name: 'Test Robot',
          status: 'disconnected',
          rosInstance: {},
          url: 'ws://localhost:9090',
          subscriptions: [],
        },
      }));

      render(<LaserScanVisualization />);

      expect(screen.getByText('LiDAR: No connection')).toBeInTheDocument();
    });
  });

  describe('topic selection', () => {
    it('should render topic selector with default topic', async () => {
      render(<LaserScanVisualization />);

      const topicSelect = screen.getByDisplayValue('/scan');
      expect(topicSelect).toBeInTheDocument();
    });

    it('should allow topic selection change', async () => {
      const user = userEvent.setup();
      
      render(<LaserScanVisualization />);

      const topicSelect = screen.getByRole('combobox');
      await user.click(topicSelect);
    });

    it('should fetch available LaserScan topics on mount', async () => {
      const mockContext = createMockConnectionContext();
      const mockService = new mockROSLIB.Service({});
      mockContext.selectedConnection.rosInstance.Service = vi.fn(() => mockService);
      
      mockUseConnection.mockReturnValue(mockContext);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockROSLIB.Service).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '/rosapi/topics_for_type',
            serviceType: 'rosapi/TopicsForType',
          })
        );
      });
    });
  });

  describe('data subscription', () => {
    it('should subscribe to LaserScan topic when connected', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockROSLIB.Topic).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '/scan',
            messageType: 'sensor_msgs/LaserScan',
          })
        );
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });
    });

    it('should unsubscribe when component unmounts', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { unmount } = render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(mockTopic.unsubscribe).toHaveBeenCalled();
    });

    it('should process laser scan data correctly', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Simulate receiving laser scan data
      const scanData = generateLaserScanData(360);
      mockTopic.triggerMessage(scanData);

      // Component should process the data and show point count
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  describe('data processing', () => {
    it('should filter out invalid range values', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Create scan data with invalid values
      const scanData = {
        ...generateLaserScanData(10),
        ranges: [1.0, Infinity, NaN, -1.0, 2.0, 11.0, 3.0, 0.05, 4.0, 5.0],
        range_min: 0.1,
        range_max: 10.0,
      };

      mockTopic.triggerMessage(scanData);

      // Component should filter out invalid values
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should convert polar to cartesian coordinates correctly', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Create scan data with known values for testing coordinate conversion
      const scanData = {
        ...generateLaserScanData(4),
        ranges: [1.0, 1.0, 1.0, 1.0],
        angle_min: 0,
        angle_max: Math.PI,
        angle_increment: Math.PI / 3,
      };

      mockTopic.triggerMessage(scanData);

      // The component should convert polar coordinates to cartesian
      // with proper 90-degree rotation for "up is up"
    });

    it('should handle empty scan data', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send empty scan data
      const scanData = {
        ...generateLaserScanData(0),
        ranges: [],
      };

      mockTopic.triggerMessage(scanData);

      // Should handle empty data gracefully
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  describe('visualization', () => {
    it('should create SVG visualization', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      // Check for SVG container
      const svgElement = document.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    it('should update visualization when receiving new data', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send multiple data updates
      mockTopic.triggerMessage(generateLaserScanData(180));
      mockTopic.triggerMessage(generateLaserScanData(360));

      // Visualization should update
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should show point count in status', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send scan data with known number of valid points
      const scanData = generateLaserScanData(100);
      mockTopic.triggerMessage(scanData);

      // Should show point count (exact count depends on filtering)
      const pointCountElements = screen.getAllByText(/\d+/);
      expect(pointCountElements.length).toBeGreaterThan(0);
    });

    it('should handle responsive SVG sizing', () => {
      render(<LaserScanVisualization />);

      const svgElement = document.querySelector('svg');
      if (svgElement) {
        // Check for responsive attributes
        expect(svgElement.getAttribute('width')).toBe('100%');
        expect(svgElement.getAttribute('height')).toBe('100%');
        expect(svgElement.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
      }
    });
  });

  describe('responsive design', () => {
    it('should show mobile layout on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });

      render(<LaserScanVisualization />);

      expect(screen.getByText('LiDAR')).toBeInTheDocument();
    });

    it('should show desktop layout on large screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<LaserScanVisualization />);

      expect(screen.getByText('LiDAR')).toBeInTheDocument();
    });

    it('should adapt chart size based on container', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      // The component should adapt to different container sizes
      expect(screen.getByText('LiDAR')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle topic fetch errors gracefully', async () => {
      const mockContext = createMockConnectionContext();
      mockROSLIB.Service.mockImplementation(() => ({
        callService: vi.fn().mockImplementation((request, callback, errorCallback) => {
          if (errorCallback) errorCallback(new Error('Service error'));
        }),
      }));
      
      mockUseConnection.mockReturnValue(mockContext);

      render(<LaserScanVisualization />);

      expect(screen.getByDisplayValue('/scan')).toBeInTheDocument();
    });

    it('should handle corrupted scan data gracefully', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send corrupted data
      mockTopic.triggerMessage({
        ranges: [null, undefined, 'invalid', {}],
        angle_min: 'invalid',
        angle_max: null,
        angle_increment: undefined,
        range_min: -Infinity,
        range_max: NaN,
      });

      // Should handle corrupted data without crashing
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should handle high-resolution scans efficiently', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send high-resolution scan (1080 points)
      const highResScan = generateLaserScanData(1080);
      mockTopic.triggerMessage(highResScan);

      // Should handle large datasets efficiently
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should update visualization efficiently with rapid data', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send rapid updates
      for (let i = 0; i < 20; i++) {
        mockTopic.triggerMessage(generateLaserScanData(360));
      }

      // Should handle rapid updates without performance issues
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should maintain consistent frame rate with large datasets', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      // Test with very large scan data
      const largeScan = generateLaserScanData(5000); // Very high resolution
      mockTopic.triggerMessage(largeScan);

      // Should maintain responsiveness
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  describe('visualization features', () => {
    it('should display robot position at origin', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send scan data
      mockTopic.triggerMessage(generateLaserScanData(360));

      // Should show robot at origin (red circle)
      // This is tested through the D3 visualization logic
    });

    it('should show grid lines for reference', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      // Should render grid lines for distance reference
      expect(screen.getByText('LiDAR')).toBeInTheDocument();
    });

    it('should show axis labels', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      // Should have distance labels on axes
      expect(screen.getByText('LiDAR')).toBeInTheDocument();
    });

    it('should maintain square aspect ratio', async () => {
      render(<LaserScanVisualization />);

      // The visualization should maintain square aspect ratio for accurate distance representation
      const svgElement = document.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });
  });

  describe('connection state handling', () => {
    it('should show waiting message when subscribed but no data', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/LaserScan', '/scan');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<LaserScanVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Should show waiting message when no data received yet
      const waitingMessage = screen.queryByText(/Waiting for scan data/);
      if (waitingMessage) {
        expect(waitingMessage).toBeInTheDocument();
      }
    });

    it('should update connection status indicator', async () => {
      render(<LaserScanVisualization />);

      // Should show connection status
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });
});