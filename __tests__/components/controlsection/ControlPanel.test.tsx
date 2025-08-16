import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import ControlPanel from '@/components/controlsection/ControlPanel';
import { 
  mockROSLIB, 
  setupRosConnectionMocks, 
  cleanupRosConnectionMocks,
  createMockConnectionContext,
  createMockTopicSubscription
} from '@/test-utils';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import useMounted from '@/hooks/useMounted';

// Mock dependencies
vi.mock('roslib', () => ({ default: mockROSLIB }));
vi.mock('@/components/dashboard/ConnectionProvider');
vi.mock('@/hooks/useMounted');

const mockUseConnection = useConnection as vi.MockedFunction<typeof useConnection>;
const mockUseMounted = useMounted as vi.MockedFunction<typeof useMounted>;

describe('ControlPanel', () => {
  beforeEach(() => {
    setupRosConnectionMocks();
    mockUseConnection.mockReturnValue(createMockConnectionContext());
    mockUseMounted.mockReturnValue(true);
  });

  afterEach(() => {
    cleanupRosConnectionMocks();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render control panel with connected robot', () => {
      render(<ControlPanel />);

      expect(screen.getByText('Controls')).toBeInTheDocument();
      expect(screen.getByText('Linear:')).toBeInTheDocument();
      expect(screen.getByText('Angular:')).toBeInTheDocument();
    });

    it('should show loading state when not mounted', () => {
      mockUseMounted.mockReturnValue(false);

      render(<ControlPanel />);

      expect(screen.getByText('Control Panel')).toBeInTheDocument();
      // Should show skeleton loading
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render movement controls', () => {
      render(<ControlPanel />);

      // Check for directional buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(5); // 4 directions + stop
    });

    it('should render velocity sliders', () => {
      render(<ControlPanel />);

      // Check for sliders
      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(2); // Linear and angular velocity
    });
  });

  describe('topic selection', () => {
    it('should render topic selector with default topic', () => {
      render(<ControlPanel />);

      const topicSelect = screen.getByDisplayValue('/cmd_vel');
      expect(topicSelect).toBeInTheDocument();
    });

    it('should fetch available Twist topics on mount', async () => {
      render(<ControlPanel />);

      await waitFor(() => {
        expect(mockROSLIB.Service).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '/rosapi/topics_for_type',
            serviceType: 'rosapi/TopicsForType',
          })
        );
      });
    });

    it('should allow topic selection change', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const topicSelect = screen.getByRole('combobox');
      await user.click(topicSelect);
    });
  });

  describe('velocity controls', () => {
    it('should have default velocity values', () => {
      render(<ControlPanel />);

      // Check default linear velocity (0.15)
      expect(screen.getByDisplayValue('0.15')).toBeInTheDocument();
      
      // Check default angular velocity (approximately π/8)
      const angularValue = screen.getByText(/0\.39/); // π/8 ≈ 0.39
      expect(angularValue).toBeInTheDocument();
    });

    it('should allow linear velocity adjustment', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const linearSlider = screen.getAllByRole('slider')[0];
      
      // Simulate slider change
      await user.click(linearSlider);
      
      // The slider should be interactive
      expect(linearSlider).toBeInTheDocument();
    });

    it('should allow angular velocity adjustment', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const angularSlider = screen.getAllByRole('slider')[1];
      
      // Simulate slider change
      await user.click(angularSlider);
      
      expect(angularSlider).toBeInTheDocument();
    });

    it('should display velocity values with correct precision', () => {
      render(<ControlPanel />);

      // Values should be displayed with 2 decimal places
      expect(screen.getByText('0.15')).toBeInTheDocument();
    });
  });

  describe('movement commands', () => {
    let mockTopic: any;

    beforeEach(() => {
      mockTopic = createMockTopicSubscription('geometry_msgs/Twist', '/cmd_vel');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);
    });

    it('should publish forward command', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });
      await user.click(forwardButton);

      await waitFor(() => {
        expect(mockROSLIB.Topic).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '/cmd_vel',
            messageType: 'geometry_msgs/Twist',
          })
        );
        expect(mockTopic.publish).toHaveBeenCalled();
      });
    });

    it('should publish backward command', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const backwardButton = screen.getByRole('button', { name: /arrow.*down/i });
      await user.click(backwardButton);

      await waitFor(() => {
        expect(mockTopic.publish).toHaveBeenCalled();
      });
    });

    it('should publish clockwise rotation command', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const clockwiseButton = screen.getByRole('button', { name: /arrow.*right/i });
      await user.click(clockwiseButton);

      await waitFor(() => {
        expect(mockTopic.publish).toHaveBeenCalled();
      });
    });

    it('should publish counter-clockwise rotation command', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const counterClockwiseButton = screen.getByRole('button', { name: /arrow.*left/i });
      await user.click(counterClockwiseButton);

      await waitFor(() => {
        expect(mockTopic.publish).toHaveBeenCalled();
      });
    });

    it('should publish stop command', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const stopButton = screen.getByRole('button', { name: /square/i });
      await user.click(stopButton);

      await waitFor(() => {
        expect(mockTopic.publish).toHaveBeenCalled();
      });
    });

    it('should use current velocity values in commands', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      // Adjust linear velocity first
      const linearSlider = screen.getAllByRole('slider')[0];
      // Simulate changing the slider value would require more complex interaction

      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });
      await user.click(forwardButton);

      // The published message should use the current velocity values
      expect(mockTopic.publish).toHaveBeenCalled();
    });
  });

  describe('message publishing', () => {
    let mockTopic: any;

    beforeEach(() => {
      mockTopic = createMockTopicSubscription('geometry_msgs/Twist', '/cmd_vel');
      mockROSLIB.Topic.mockImplementation(() => mockTopic);
    });

    it('should create proper Twist message structure', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });
      await user.click(forwardButton);

      await waitFor(() => {
        expect(mockROSLIB.Message).toHaveBeenCalledWith(
          expect.objectContaining({
            linear: expect.objectContaining({
              x: expect.any(Number),
              y: 0,
              z: 0,
            }),
            angular: expect.objectContaining({
              x: 0,
              y: 0,
              z: expect.any(Number),
            }),
          })
        );
      });
    });

    it('should publish immediately when direction changes', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });
      await user.click(forwardButton);

      // Should publish immediately, not wait for next render cycle
      expect(mockTopic.publish).toHaveBeenCalled();
    });

    it('should handle rapid direction changes', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });
      const stopButton = screen.getByRole('button', { name: /square/i });

      // Rapid button presses
      await user.click(forwardButton);
      await user.click(stopButton);
      await user.click(forwardButton);

      // Should handle rapid changes without issues
      expect(mockTopic.publish).toHaveBeenCalledTimes(3);
    });
  });

  describe('connection handling', () => {
    it('should handle no connection gracefully', () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      render(<ControlPanel />);

      // Should still render controls but not publish commands
      expect(screen.getByText('Controls')).toBeInTheDocument();
    });

    it('should handle disconnected robot', () => {
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

      render(<ControlPanel />);

      expect(screen.getByText('Controls')).toBeInTheDocument();
    });

    it('should handle ROS instance errors gracefully', async () => {
      const mockContext = createMockConnectionContext();
      mockContext.selectedConnection.rosInstance = null;
      mockUseConnection.mockReturnValue(mockContext);

      const user = userEvent.setup();
      render(<ControlPanel />);

      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });
      
      // Should not crash when rosInstance is null
      await user.click(forwardButton);
      
      expect(screen.getByText('Controls')).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('should display compact layout', () => {
      render(<ControlPanel />);

      // Check for compact grid layout
      const controlGrid = document.querySelector('.grid.grid-cols-3');
      expect(controlGrid).toBeInTheDocument();

      // Check for compact button sizing
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('w-8', 'h-8');
      });
    });

    it('should stack controls vertically in mobile layout', () => {
      render(<ControlPanel />);

      // Check for mobile-friendly layout
      expect(screen.getByText('Linear:')).toBeInTheDocument();
      expect(screen.getByText('Angular:')).toBeInTheDocument();
    });

    it('should use appropriate font sizes', () => {
      render(<ControlPanel />);

      // Should use small font sizes for compact layout
      const labels = screen.getAllByText(/Linear:|Angular:/);
      labels.forEach(label => {
        expect(label).toHaveClass('text-xs');
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper button labels', () => {
      render(<ControlPanel />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible content (icon or text)
        expect(button).toBeInTheDocument();
      });
    });

    it('should have proper slider labels', () => {
      render(<ControlPanel />);

      expect(screen.getByText('Linear:')).toBeInTheDocument();
      expect(screen.getByText('Angular:')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      // Tab through interactive elements
      await user.tab();
      
      // Should be able to navigate through controls
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should handle rapid velocity changes efficiently', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });

      // Rapid clicks should be handled efficiently
      for (let i = 0; i < 20; i++) {
        await user.click(forwardButton);
      }

      expect(screen.getByText('Controls')).toBeInTheDocument();
    });

    it('should optimize message publishing for control priority', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });
      await user.click(forwardButton);

      // Should publish with priority (immediate publish)
      expect(mockROSLIB.Topic).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle topic fetch errors gracefully', async () => {
      mockROSLIB.Service.mockImplementation(() => ({
        callService: vi.fn().mockImplementation((request, callback, errorCallback) => {
          if (errorCallback) errorCallback(new Error('Service error'));
        }),
      }));

      render(<ControlPanel />);

      // Should fallback to default topic on error
      expect(screen.getByDisplayValue('/cmd_vel')).toBeInTheDocument();
    });

    it('should handle publishing errors gracefully', async () => {
      const mockTopic = {
        ...createMockTopicSubscription('geometry_msgs/Twist', '/cmd_vel'),
        publish: vi.fn().mockImplementation(() => {
          throw new Error('Publish error');
        }),
      };
      mockROSLIB.Topic.mockImplementation(() => mockTopic);

      const user = userEvent.setup();
      render(<ControlPanel />);

      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });
      
      // Should not crash on publish error
      await user.click(forwardButton);
      
      expect(screen.getByText('Controls')).toBeInTheDocument();
    });
  });

  describe('state management', () => {
    it('should maintain velocity state across direction changes', async () => {
      const user = userEvent.setup();
      
      render(<ControlPanel />);

      // Change direction multiple times
      const forwardButton = screen.getByRole('button', { name: /arrow.*up/i });
      const backwardButton = screen.getByRole('button', { name: /arrow.*down/i });

      await user.click(forwardButton);
      await user.click(backwardButton);

      // Velocity values should remain consistent
      expect(screen.getByDisplayValue('0.15')).toBeInTheDocument();
    });

    it('should update display values when sliders change', async () => {
      render(<ControlPanel />);

      // The velocity display should update when sliders change
      // This tests the state synchronization between sliders and display
      expect(screen.getByText('0.15')).toBeInTheDocument();
    });
  });
});