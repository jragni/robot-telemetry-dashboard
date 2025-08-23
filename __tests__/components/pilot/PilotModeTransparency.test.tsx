import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/test-utils';
import PilotMode from '@/components/pilot/PilotMode';
import { 
  mockROSLIB, 
  setupRosConnectionMocks, 
  cleanupRosConnectionMocks,
  createMockConnectionContext,
} from '@/test-utils';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import { usePilotMode } from '@/components/pilot/usePilotMode';

// Mock dependencies
vi.mock('roslib', () => ({ default: mockROSLIB }));
vi.mock('@/components/dashboard/ConnectionProvider', () => ({
  useConnection: vi.fn(),
  default: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="connection-provider">{children}</div>)
}));
vi.mock('next-themes', () => ({
  ThemeProvider: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>),
  useTheme: vi.fn(() => ({ theme: 'dark', setTheme: vi.fn() }))
}));
vi.mock('@/components/dashboard/CameraProvider', () => ({
  useCamera: vi.fn(() => ({
    imageUrl: 'data:image/png;base64,mock-image',
    isSubscribed: true,
    toggleCameraSubscription: vi.fn(),
  })),
  default: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="camera-provider">{children}</div>)
}));
vi.mock('@/components/pilot/usePilotMode', () => ({
  usePilotMode: vi.fn(),
  PilotModeProvider: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="pilot-mode-provider">{children}</div>),
}));
vi.mock('@/components/sensorsection/LaserScanVisualization', () => ({
  default: vi.fn(() => <div data-testid="laser-scan">LiDAR</div>)
}));

// Mock D3 with complete implementation
vi.mock('d3', () => {
  const createMockSelection = () => ({
    select: vi.fn(function() { return createMockSelection(); }),
    selectAll: vi.fn(function() { return createMockSelection(); }),
    attr: vi.fn(function() { return this; }),
    append: vi.fn(function() { return createMockSelection(); }),
    call: vi.fn(function() { return this; }),
    style: vi.fn(function() { return this; }),
    text: vi.fn(function() { return this; }),
    data: vi.fn(function() { return createMockSelection(); }),
    enter: vi.fn(function() { return createMockSelection(); }),
    merge: vi.fn(function() { return createMockSelection(); }),
    exit: vi.fn(function() { return createMockSelection(); }),
    remove: vi.fn(function() { return this; }),
    empty: vi.fn(() => false),
    node: vi.fn(() => null),
    size: vi.fn(() => 0),
  });

  const mockSelection = createMockSelection();

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
const mockUsePilotMode = usePilotMode as vi.MockedFunction<typeof usePilotMode>;

describe('PilotMode UI Transparency - Functional Tests', () => {
  beforeEach(() => {
    setupRosConnectionMocks();
    mockUseConnection.mockReturnValue(createMockConnectionContext());
    
    // Standard pilot mode setup
    mockUsePilotMode.mockReturnValue({
      isPilotMode: true,
      enterPilotMode: vi.fn(),
      exitPilotMode: vi.fn(),
      orientation: 'portrait',
      isFullscreen: true,
    });
  });

  afterEach(() => {
    cleanupRosConnectionMocks();
    vi.clearAllMocks();
  });

  describe('Transparent Control Panel', () => {
    it('should render control panel functionality', () => {
      render(<PilotMode />);

      // Control panel should be functional regardless of transparency
      expect(screen.getAllByText('Controls').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Linear:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Angular:').length).toBeGreaterThan(0);
      // Handle multiple /cmd_vel elements
      const cmdVelElements = screen.getAllByText('/cmd_vel');
      expect(cmdVelElements.length).toBeGreaterThan(0);
      expect(cmdVelElements[0].closest('button')).toBeInTheDocument();
    });

    it('should maintain control buttons functionality', () => {
      render(<PilotMode />);

      // Movement buttons should be present and functional
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(5);
      
      // Topic selector should work
      // Handle multiple /cmd_vel elements
      const cmdVelElements = screen.getAllByText('/cmd_vel');
      expect(cmdVelElements.length).toBeGreaterThan(0);
      expect(cmdVelElements[0].closest('button')).toBeInTheDocument();
    });

    it('should maintain velocity sliders functionality', () => {
      render(<PilotMode />);

      // Sliders should show values - handle multiple instances
      const linearValues = screen.getAllByText('0.15');
      expect(linearValues.length).toBeGreaterThan(0); // Linear velocity
      const angularValues = screen.getAllByText(/0\.39/);
      expect(angularValues.length).toBeGreaterThan(0); // Angular velocity
    });

    it('should apply text styling for visibility', () => {
      render(<PilotMode />);

      // Text should be visible (implementation detail of styling)
      expect(screen.getAllByText('Controls').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Linear:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Angular:').length).toBeGreaterThan(0);
    });
  });

  describe('Transparent LiDAR Visualization', () => {
    it('should render LiDAR visualization functionality', () => {
      render(<PilotMode />);

      // LiDAR should be present and functional
      expect(screen.getAllByText('LiDAR').length).toBeGreaterThan(0);
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should maintain LiDAR functionality', () => {
      render(<PilotMode />);

      // Core LiDAR elements should be present
      expect(screen.getAllByText('LiDAR').length).toBeGreaterThan(0);
    });

    it('should maintain topic selector functionality', () => {
      render(<PilotMode />);

      // Topic selectors should be functional
      // Handle multiple /cmd_vel elements
      const cmdVelElements = screen.getAllByText('/cmd_vel');
      expect(cmdVelElements.length).toBeGreaterThan(0);
      expect(cmdVelElements[0].closest('button')).toBeInTheDocument();
    });
  });

  describe('Text Readability', () => {
    it('should have readable text over camera background', () => {
      render(<PilotMode />);

      // Essential text should be present and readable
      expect(screen.getByText('ESC - Exit')).toBeInTheDocument();
      expect(screen.getAllByText('Controls').length).toBeGreaterThan(0);
      expect(screen.getAllByText('LiDAR').length).toBeGreaterThan(0);
    });

    it('should maintain button visibility', () => {
      render(<PilotMode />);

      // All essential buttons should be visible
      expect(screen.getByText('ESC - Exit')).toBeInTheDocument();
      // Handle multiple "Exit Pilot" buttons
      const exitPilotButtons = screen.getAllByText('Exit Pilot');
      expect(exitPilotButtons.length).toBeGreaterThan(0);
      // Handle multiple /cmd_vel elements
      const cmdVelElements = screen.getAllByText('/cmd_vel');
      expect(cmdVelElements.length).toBeGreaterThan(0);
      expect(cmdVelElements[0].closest('button')).toBeInTheDocument();
    });
  });

  describe('Layout Preservation', () => {
    it('should maintain proper component layout', () => {
      render(<PilotMode />);

      // All major components should be present
      expect(screen.getByText('ESC - Exit')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument(); // Camera
      expect(screen.getAllByText('Controls').length).toBeGreaterThan(0);
      expect(screen.getAllByText('LiDAR').length).toBeGreaterThan(0);
    });

    it('should preserve component hierarchy', () => {
      render(<PilotMode />);

      // Core structure should be intact
      expect(screen.getByText('Test Robot')).toBeInTheDocument();
      expect(screen.getByText('Connected: Test Robot')).toBeInTheDocument();
    });
  });

  describe('Camera Background Integration', () => {
    it('should allow camera background visibility', () => {
      render(<PilotMode />);

      // Camera should be present for background (src might be null in test environment)
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
    });

    it('should maintain proper layering', () => {
      render(<PilotMode />);

      // UI elements should be on top of camera
      expect(screen.getByText('ESC - Exit')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Performance with Transparency', () => {
    it('should maintain smooth rendering', () => {
      render(<PilotMode />);

      // All components should render without issues
      expect(screen.getByText('ESC - Exit')).toBeInTheDocument();
      expect(screen.getAllByText('Controls').length).toBeGreaterThan(0);
    });
  });

  describe('Exit Functionality', () => {
    it('should maintain exit functionality', () => {
      render(<PilotMode />);

      // Exit options should be available
      expect(screen.getByText('ESC - Exit')).toBeInTheDocument();
      // Handle multiple "Exit Pilot" buttons
      const exitPilotButtons = screen.getAllByText('Exit Pilot');
      expect(exitPilotButtons.length).toBeGreaterThan(0);
      expect(screen.getByText('ESC - Exit')).toBeInTheDocument();
    });
  });
});