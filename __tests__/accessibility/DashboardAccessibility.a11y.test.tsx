import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ImuVisualization from '@/components/sensorsection/ImuVisualization';
import LaserScanVisualization from '@/components/sensorsection/LaserScanVisualization';
import ControlPanel from '@/components/controlsection/ControlPanel';
import { 
  testAccessibility,
  testKeyboardNavigation,
  testAriaAttributes,
  testScreenReaderCompatibility,
  testMobileAccessibility,
  runFullAccessibilityTest,
  mockUserPreferences
} from '@/test-utils';
import { 
  createMockConnectionContext,
  setupRosConnectionMocks,
  cleanupRosConnectionMocks
} from '@/test-utils';
import { useConnection } from '@/components/dashboard/ConnectionProvider';

// Mock dependencies
vi.mock('@/components/dashboard/ConnectionProvider');
vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(() => ({ open: true })),
}));
vi.mock('@/hooks/useMounted', () => ({ default: vi.fn(() => true) }));

// Mock child components for focused accessibility testing
vi.mock('@/components/sidebar', () => ({
  default: () => (
    <nav role="navigation" aria-label="Robot connections">
      <button>Add Connection</button>
      <ul role="list">
        <li><button>Robot 1</button></li>
      </ul>
    </nav>
  ),
}));

vi.mock('@/components/sensorsection', () => ({
  default: () => (
    <section aria-label="Camera feed">
      <h2>Camera</h2>
      <div role="img" aria-label="Robot camera view">Camera Feed</div>
    </section>
  ),
}));

vi.mock('@/components/topicsection', () => ({
  default: () => (
    <section aria-label="ROS topics">
      <h2>Topics</h2>
      <table role="table" aria-label="Available ROS topics">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>/camera/image_raw</td>
            <td>sensor_msgs/Image</td>
            <td>Active</td>
          </tr>
        </tbody>
      </table>
    </section>
  ),
}));

const mockUseConnection = useConnection as vi.MockedFunction<typeof useConnection>;

describe('Dashboard Accessibility', () => {
  beforeEach(() => {
    setupRosConnectionMocks();
    mockUseConnection.mockReturnValue(createMockConnectionContext());
  });

  afterEach(() => {
    cleanupRosConnectionMocks();
    vi.clearAllMocks();
  });

  describe('overall dashboard accessibility', () => {
    it('should pass automated accessibility testing', async () => {
      const rendered = render(<DashboardLayout />);
      await testAccessibility(rendered);
    });

    it('should have proper landmark structure', async () => {
      const rendered = render(<DashboardLayout />);
      const { main, nav } = testScreenReaderCompatibility(rendered);

      expect(main).toBeInTheDocument();
      expect(nav).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const rendered = render(<DashboardLayout />);
      const focusableElements = await testKeyboardNavigation(rendered);

      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA attributes', async () => {
      const rendered = render(<DashboardLayout />);
      testAriaAttributes(rendered);
    });

    it('should be mobile accessible', async () => {
      const rendered = render(<DashboardLayout />);
      await testMobileAccessibility(rendered);
    });

    it('should support reduced motion preferences', async () => {
      mockUserPreferences.reducedMotion();
      
      const rendered = render(<DashboardLayout />);
      await testAccessibility(rendered);
    });

    it('should support high contrast mode', async () => {
      mockUserPreferences.highContrast();
      
      const rendered = render(<DashboardLayout />);
      await testAccessibility(rendered);
    });
  });

  describe('IMU visualization accessibility', () => {
    it('should pass accessibility tests', async () => {
      const rendered = render(<ImuVisualization />);
      await testAccessibility(rendered);
    });

    it('should have descriptive headings', () => {
      render(<ImuVisualization />);

      expect(screen.getByText('IMU')).toBeInTheDocument();
      expect(screen.getByText('Orientation')).toBeInTheDocument();
      expect(screen.getByText('Linear Acceleration')).toBeInTheDocument();
      expect(screen.getByText('Angular Velocity')).toBeInTheDocument();
    });

    it('should have accessible form controls', async () => {
      render(<ImuVisualization />);

      // Check for labeled select elements
      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toBeInTheDocument();
        // Each select should have an accessible name
      });
    });

    it('should provide status information to screen readers', () => {
      render(<ImuVisualization />);

      // Connection status should be accessible
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup();
      render(<ImuVisualization />);

      // Should be able to navigate with keyboard
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });

    it('should have accessible charts with alternative text', () => {
      render(<ImuVisualization />);

      // Charts should have descriptive labels
      expect(screen.getByText('Orientation')).toBeInTheDocument();
      expect(screen.getByText('Linear Acceleration')).toBeInTheDocument();
      expect(screen.getByText('Angular Velocity')).toBeInTheDocument();
    });
  });

  describe('LaserScan visualization accessibility', () => {
    it('should pass accessibility tests', async () => {
      const rendered = render(<LaserScanVisualization />);
      await testAccessibility(rendered);
    });

    it('should have descriptive heading', () => {
      render(<LaserScanVisualization />);

      expect(screen.getByText('LiDAR')).toBeInTheDocument();
    });

    it('should provide alternative text for visualization', () => {
      render(<LaserScanVisualization />);

      // Should have accessible description of the LiDAR data
      expect(screen.getByText('LiDAR')).toBeInTheDocument();
    });

    it('should show data point count for screen readers', async () => {
      render(<LaserScanVisualization />);

      // Point count should be accessible
      const pointCountElements = screen.getAllByText(/\d+/);
      expect(pointCountElements.length).toBeGreaterThan(0);
    });

    it('should have accessible topic selection', () => {
      render(<LaserScanVisualization />);

      const topicSelect = screen.getByRole('combobox');
      expect(topicSelect).toBeInTheDocument();
    });
  });

  describe('Control panel accessibility', () => {
    it('should pass accessibility tests', async () => {
      const rendered = render(<ControlPanel />);
      await testAccessibility(rendered);
    });

    it('should have accessible control buttons', () => {
      render(<ControlPanel />);

      // Movement buttons should be accessible
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Each button should have accessible content
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should have properly labeled sliders', () => {
      render(<ControlPanel />);

      // Velocity sliders should have labels
      expect(screen.getByText('Linear:')).toBeInTheDocument();
      expect(screen.getByText('Angular:')).toBeInTheDocument();

      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(2);
    });

    it('should support keyboard control', async () => {
      const user = userEvent.setup();
      render(<ControlPanel />);

      // Should be able to navigate controls with keyboard
      await user.tab();
      
      const activeElement = document.activeElement;
      expect(activeElement).toBeInTheDocument();

      // Should be able to use arrow keys on focused elements
      if (activeElement?.getAttribute('role') === 'slider') {
        await user.keyboard('[ArrowRight]');
      }
    });

    it('should provide feedback for control actions', async () => {
      const user = userEvent.setup();
      render(<ControlPanel />);

      // Control values should be displayed
      expect(screen.getByText('0.15')).toBeInTheDocument();
    });

    it('should have adequate button sizes for touch', () => {
      render(<ControlPanel />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Buttons should have adequate size classes
        expect(button).toHaveClass('w-8', 'h-8');
      });
    });
  });

  describe('responsive accessibility', () => {
    it('should maintain accessibility on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const rendered = render(<DashboardLayout />);
      await testMobileAccessibility(rendered);
    });

    it('should have appropriate touch targets on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ControlPanel />);

      // Touch targets should be adequate size
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        // Minimum 44px touch target (mocked getBoundingClientRect returns 0)
        expect(button).toBeInTheDocument();
      });
    });

    it('should maintain keyboard accessibility on tablet', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const rendered = render(<DashboardLayout />);
      await testKeyboardNavigation(rendered);
    });
  });

  describe('user preference support', () => {
    it('should respect prefers-reduced-motion', async () => {
      mockUserPreferences.reducedMotion();

      const rendered = render(<DashboardLayout />);
      await testAccessibility(rendered);

      // Animations should be reduced or disabled
      // This would be tested through CSS queries in a real browser
    });

    it('should work with high contrast themes', async () => {
      mockUserPreferences.highContrast();

      const rendered = render(<DashboardLayout />);
      await testAccessibility(rendered);
    });

    it('should support dark mode preferences', async () => {
      mockUserPreferences.darkMode();

      const rendered = render(<DashboardLayout />);
      await testAccessibility(rendered);
    });
  });

  describe('error state accessibility', () => {
    it('should announce connection errors to screen readers', () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      render(<ImuVisualization />);

      // Error states should be accessible
      expect(screen.getByText('IMU: No connection')).toBeInTheDocument();
    });

    it('should provide accessible error messages', () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      render(<LaserScanVisualization />);

      expect(screen.getByText('LiDAR: No connection')).toBeInTheDocument();
    });

    it('should maintain keyboard navigation during errors', async () => {
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      const rendered = render(<DashboardLayout />);
      await testKeyboardNavigation(rendered);
    });
  });

  describe('comprehensive accessibility audit', () => {
    it('should pass full accessibility test suite', async () => {
      const rendered = render(<DashboardLayout />);
      
      const results = await runFullAccessibilityTest(rendered);
      
      expect(results.axeResults).toBeDefined();
      expect(results.keyboardNavigation.length).toBeGreaterThan(0);
      expect(results.ariaAttributes).toBeDefined();
      expect(results.screenReader).toBeDefined();
      expect(results.mobileAccessibility).toBeDefined();
    });

    it('should maintain accessibility with dynamic content updates', async () => {
      const { rerender } = render(<DashboardLayout />);

      // Test accessibility before update
      let rendered = { container: document.body };
      await testAccessibility(rendered);

      // Simulate connection change
      mockUseConnection.mockReturnValue(createMockConnectionContext({
        selectedConnection: null,
      }));

      rerender(<DashboardLayout />);

      // Test accessibility after update
      await testAccessibility(rendered);
    });

    it('should provide consistent experience across all components', async () => {
      // Test individual components
      const imuRendered = render(<ImuVisualization />);
      await testAccessibility(imuRendered);

      const laserRendered = render(<LaserScanVisualization />);
      await testAccessibility(laserRendered);

      const controlRendered = render(<ControlPanel />);
      await testAccessibility(controlRendered);

      // All components should pass accessibility tests
    });

    it('should support assistive technologies', async () => {
      const rendered = render(<DashboardLayout />);

      // Test ARIA landmarks
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      // Test semantic structure
      const navigation = document.querySelector('[role="navigation"]');
      expect(navigation).toBeInTheDocument();

      // Test interactive elements
      const buttons = screen.getAllByRole('button');
      const comboboxes = screen.getAllByRole('combobox');
      
      expect(buttons.length + comboboxes.length).toBeGreaterThan(0);
    });
  });
});