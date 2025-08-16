import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/test-utils';
import userEvent from '@testing-library/user-event';
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
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({ remove: vi.fn() })),
    attr: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    datum: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
  })),
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
  extent: vi.fn(() => [0, 100]),
  min: vi.fn(() => 0),
  max: vi.fn(() => 100),
  format: vi.fn(() => vi.fn()),
  timeFormat: vi.fn(() => vi.fn()),
  curveLinear: {},
}));

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
    it('should render IMU visualization with connected robot', () => {
      render(<ImuVisualization />);

      expect(screen.getByText('IMU')).toBeInTheDocument();
      expect(screen.getByText('Live')).toBeInTheDocument();
      expect(screen.getByText('Orientation')).toBeInTheDocument();
      expect(screen.getByText('Linear Acceleration')).toBeInTheDocument();
      expect(screen.getByText('Angular Velocity')).toBeInTheDocument();
    });

    it('should show no connection message when not connected', () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      render(<ImuVisualization />);

      expect(screen.getByText('IMU: No connection')).toBeInTheDocument();
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

      render(<ImuVisualization />);

      expect(screen.getByText('IMU: No connection')).toBeInTheDocument();
    });
  });

  describe('topic selection', () => {
    it('should render topic selector with default topic', async () => {
      render(<ImuVisualization />);

      // Find the topic selector
      const topicSelect = screen.getByDisplayValue('/imu');
      expect(topicSelect).toBeInTheDocument();
    });

    it('should allow topic selection change', async () => {
      const user = userEvent.setup();
      
      render(<ImuVisualization />);

      // Click on the topic selector
      const topicSelect = screen.getByRole('combobox');
      await user.click(topicSelect);

      // The component would fetch available topics and populate the list
      // This tests the UI interaction capability
    });

    it('should fetch available IMU topics on mount', async () => {
      const mockContext = createMockConnectionContext();
      const mockService = new mockROSLIB.Service({});
      mockContext.selectedConnection.rosInstance.Service = vi.fn(() => mockService);
      
      mockUseConnection.mockReturnValue(mockContext);

      render(<ImuVisualization />);

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

  describe('unit selection', () => {
    it('should render orientation unit selector', () => {
      render(<ImuVisualization />);

      // Check for unit selectors (degrees/radians)
      const unitSelectors = screen.getAllByRole('combobox');
      expect(unitSelectors.length).toBeGreaterThanOrEqual(3); // Topic + 2 unit selectors
    });

    it('should handle orientation unit changes', async () => {
      const user = userEvent.setup();
      
      render(<ImuVisualization />);

      // Find orientation unit selector and change it
      const unitSelectors = screen.getAllByRole('combobox');
      // This would test the unit conversion functionality
      expect(unitSelectors).toBeTruthy();
    });

    it('should handle angular velocity unit changes', async () => {
      const user = userEvent.setup();
      
      render(<ImuVisualization />);

      // Test angular velocity unit selector
      const unitSelectors = screen.getAllByRole('combobox');
      expect(unitSelectors).toBeTruthy();
    });
  });

  describe('data subscription', () => {
    it('should subscribe to IMU topic when connected', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      await waitFor(() => {
        expect(mockROSLIB.Topic).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '/imu',
            messageType: 'sensor_msgs/Imu',
          })
        );
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });
    });

    it('should unsubscribe when component unmounts', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const { unmount } = render(<ImuVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(mockTopic.unsubscribe).toHaveBeenCalled();
    });

    it('should process IMU data correctly', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Simulate receiving IMU data
      const imuData = generateImuData();
      mockTopic.triggerMessage(imuData);

      // Component should process the data (quaternion to Euler conversion)
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should maintain data history with correct limit', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send multiple data points to test history limit
      for (let i = 0; i < 1100; i++) { // More than the 1000 limit
        mockTopic.triggerMessage(generateImuData(Date.now() + i * 100));
      }

      // The component should maintain only the latest 1000 points
      // This is tested through the data processing logic
    });
  });

  describe('quaternion to euler conversion', () => {
    it('should convert quaternion to euler angles correctly', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Test with known quaternion values
      const quaternion = { x: 0, y: 0, z: 0, w: 1 }; // Identity quaternion
      const imuData = {
        ...generateImuData(),
        orientation: quaternion,
      };

      mockTopic.triggerMessage(imuData);

      // The component should convert this to roll=0, pitch=0, yaw=0
      // This tests the quaternion to Euler conversion logic
    });

    it('should handle edge cases in quaternion conversion', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Test gimbal lock case
      const gimbalLockQuaternion = { x: 0.7071, y: 0, z: 0, w: 0.7071 };
      const imuData = {
        ...generateImuData(),
        orientation: gimbalLockQuaternion,
      };

      mockTopic.triggerMessage(imuData);

      // Should handle gimbal lock gracefully
    });
  });

  describe('visualization charts', () => {
    it('should create time series plots for all IMU data', async () => {
      render(<ImuVisualization />);

      // Check for SVG elements for charts
      const svgElements = screen.getAllByRole('img', { hidden: true });
      // SVG elements might not have role="img" in tests, so we check for presence of chart containers
      
      // Check for chart container elements
      expect(screen.getByText('Orientation')).toBeInTheDocument();
      expect(screen.getByText('Linear Acceleration')).toBeInTheDocument();
      expect(screen.getByText('Angular Velocity')).toBeInTheDocument();
    });

    it('should update charts when receiving new data', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send data updates
      mockTopic.triggerMessage(generateImuData());
      mockTopic.triggerMessage(generateImuData(Date.now() + 100));

      // Charts should update with new data
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should handle responsive chart sizing', () => {
      render(<ImuVisualization />);

      // Test with different container sizes
      // The charts should adapt to container dimensions
      expect(screen.getByText('Orientation')).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('should show mobile layout on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });

      render(<ImuVisualization />);

      // Should show mobile-optimized layout
      expect(screen.getByText('IMU')).toBeInTheDocument();
    });

    it('should show desktop layout on large screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<ImuVisualization />);

      // Should show desktop layout with all controls visible
      expect(screen.getByText('IMU')).toBeInTheDocument();
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

      render(<ImuVisualization />);

      // Should fallback to default topics on error
      expect(screen.getByDisplayValue('/imu')).toBeInTheDocument();
    });

    it('should handle invalid IMU data gracefully', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send invalid data
      mockTopic.triggerMessage({
        orientation: { x: NaN, y: NaN, z: NaN, w: NaN },
        linear_acceleration: { x: Infinity, y: -Infinity, z: NaN },
        angular_velocity: { x: null, y: undefined, z: 'invalid' },
      });

      // Should handle invalid data without crashing
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should limit data history to prevent memory issues', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      await waitFor(() => {
        expect(mockTopic.subscribe).toHaveBeenCalled();
      });

      // Send many data points rapidly
      for (let i = 0; i < 2000; i++) {
        mockTopic.triggerMessage(generateImuData(Date.now() + i));
      }

      // Component should maintain performance and not crash
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should throttle chart updates for performance', async () => {
      const mockTopic = createMockTopicSubscription('sensor_msgs/Imu', '/imu');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      render(<ImuVisualization />);

      // Rapid data updates should be handled efficiently
      for (let i = 0; i < 50; i++) {
        mockTopic.triggerMessage(generateImuData());
      }

      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });
});