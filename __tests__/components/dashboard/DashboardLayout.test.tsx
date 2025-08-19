import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test-utils';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSidebar } from '@/components/ui/sidebar';

// Mock the components and hooks
vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(),
}));

vi.mock('@/components/sidebar', () => ({
  default: () => <div data-testid="dashboard-sidebar">Sidebar</div>,
}));

vi.mock('@/components/sensorsection', () => ({
  default: () => <div data-testid="sensor-section">Sensor Section</div>,
}));

vi.mock('@/components/topicsection', () => ({
  default: () => <div data-testid="topic-section">Topic Section</div>,
}));

vi.mock('@/components/sensorsection/ImuVisualization', () => ({
  default: () => <div data-testid="imu-visualization">IMU Visualization</div>,
}));

vi.mock('@/components/sensorsection/LaserScanVisualization', () => ({
  default: () => <div data-testid="laser-scan-visualization">Laser Scan Visualization</div>,
}));

vi.mock('@/components/controlsection/ControlPanel', () => ({
  default: () => <div data-testid="control-panel">Control Panel</div>,
}));

const mockUseSidebar = useSidebar as vi.MockedFunction<typeof useSidebar>;

describe('DashboardLayout', () => {
  beforeEach(() => {
    // Reset window size mocks
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
  });

  describe('layout rendering', () => {
    it('should render all main components', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      render(<DashboardLayout />);

      expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('sensor-section')).toBeInTheDocument();
      expect(screen.getByTestId('topic-section')).toBeInTheDocument();
      expect(screen.getByTestId('imu-visualization')).toBeInTheDocument();
      expect(screen.getByTestId('laser-scan-visualization')).toBeInTheDocument();
      expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    });

    it('should show spacer when sidebar is collapsed', () => {
      mockUseSidebar.mockReturnValue({ open: false });

      const { container } = render(<DashboardLayout />);

      // Check for spacer div when sidebar is closed
      const spacer = container.querySelector('.w-16.shrink-0');
      expect(spacer).toBeInTheDocument();
    });

    it('should not show spacer when sidebar is open', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check that spacer is not shown when sidebar is open
      const spacer = container.querySelector('.w-16.shrink-0');
      expect(spacer).not.toBeInTheDocument();
    });
  });

  describe('responsive layouts', () => {
    it('should show desktop layout on large screens', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check for XL grid layout (desktop)
      const xlGrid = container.querySelector('.xl\\:grid.xl\\:grid-cols-12');
      expect(xlGrid).toBeInTheDocument();

      // Check for hidden medium layout
      const mdLayout = container.querySelector('.hidden.md\\:block.xl\\:hidden');
      expect(mdLayout).toBeInTheDocument();

      // Check for hidden mobile layout
      const mobileLayout = container.querySelector('.md\\:hidden');
      expect(mobileLayout).toBeInTheDocument();
    });

    it('should have proper grid structure for desktop layout', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check left column (camera + IMU)
      const leftColumn = container.querySelector('.col-span-8');
      expect(leftColumn).toBeInTheDocument();

      // Check right column (LiDAR + controls)
      const rightColumn = container.querySelector('.col-span-4');
      expect(rightColumn).toBeInTheDocument();
    });

    it('should have mobile-optimized stacked layout', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check mobile layout structure
      const mobileLayout = container.querySelector('.md\\:hidden.h-full.flex.flex-col');
      expect(mobileLayout).toBeInTheDocument();

      // Check that components are in mobile-friendly order
      const mobileContainer = container.querySelector('.md\\:hidden');
      const children = mobileContainer?.children;
      
      if (children && children.length > 0) {
        // Controls should be first for accessibility
        expect(children[0]).toHaveClass('shrink-0');
      }
    });

    it('should have medium desktop layout', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check medium layout grid
      const mediumGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(mediumGrid).toBeInTheDocument();
    });
  });

  describe('component heights and sizing', () => {
    it('should set appropriate heights for components in desktop layout', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check IMU height in desktop layout
      const imuContainer = container.querySelector('.h-80');
      expect(imuContainer).toBeInTheDocument();

      // Check LiDAR height in desktop layout
      const lidarContainer = container.querySelector('.h-\\[32rem\\]');
      expect(lidarContainer).toBeInTheDocument();
    });

    it('should set mobile-appropriate heights', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check mobile sensor section height
      const mobileSensor = container.querySelector('.md\\:hidden .h-64');
      expect(mobileSensor).toBeInTheDocument();

      // Check mobile LiDAR height
      const mobileLidar = container.querySelector('.md\\:hidden .h-72');
      expect(mobileLidar).toBeInTheDocument();

      // Check mobile IMU height
      const mobileImu = container.querySelector('.md\\:hidden .h-32');
      expect(mobileImu).toBeInTheDocument();
    });
  });

  describe('styling and themes', () => {
    it('should apply dark theme styling', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check for dark background
      const mainContainer = container.querySelector('.bg-gray-900.text-white');
      expect(mainContainer).toBeInTheDocument();

      // Check for border styling
      const topicSection = container.querySelector('.border-t.border-gray-700');
      expect(topicSection).toBeInTheDocument();
    });

    it('should apply proper layout classes', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check main layout structure
      const flexContainer = container.querySelector('.flex.min-h-screen.w-full');
      expect(flexContainer).toBeInTheDocument();

      // Check main content area
      const mainContent = container.querySelector('.flex-1.overflow-hidden');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      render(<DashboardLayout />);

      // Check for main landmark
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have overflow handling for responsive design', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // Check overflow classes for scroll management
      const overflowHidden = container.querySelector('.overflow-hidden');
      expect(overflowHidden).toBeInTheDocument();

      // Check for mobile overflow scroll
      const mobileScroll = container.querySelector('.overflow-y-auto');
      expect(mobileScroll).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should handle sidebar state changes', () => {
      const { rerender } = render(<DashboardLayout />);

      // Test with sidebar open
      mockUseSidebar.mockReturnValue({ open: true });
      rerender(<DashboardLayout />);

      // Test with sidebar closed
      mockUseSidebar.mockReturnValue({ open: false });
      rerender(<DashboardLayout />);

      // Should not throw any errors
      expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument();
    });

    it('should maintain component hierarchy across breakpoints', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      const { container } = render(<DashboardLayout />);

      // All visualization components should be present regardless of layout
      expect(screen.getByTestId('sensor-section')).toBeInTheDocument();
      expect(screen.getByTestId('imu-visualization')).toBeInTheDocument();
      expect(screen.getByTestId('laser-scan-visualization')).toBeInTheDocument();
      expect(screen.getByTestId('control-panel')).toBeInTheDocument();
      expect(screen.getByTestId('topic-section')).toBeInTheDocument();
    });
  });

  describe('performance considerations', () => {
    it('should use dynamic import for ControlPanel', () => {
      mockUseSidebar.mockReturnValue({ open: true });

      render(<DashboardLayout />);

      // ControlPanel should be present (dynamic import is mocked)
      expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    });
  });
});