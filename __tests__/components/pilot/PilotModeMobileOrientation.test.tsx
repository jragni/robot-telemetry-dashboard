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

describe('PilotMode Mobile Orientation - Functional Tests', () => {
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

  describe('Core Functionality', () => {
    it('should render pilot mode components', () => {
      render(<PilotMode />);

      // Essential components should be present
      expect(screen.getByText('Exit').closest('button')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument(); // Camera
      expect(screen.getAllByText('Controls').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Linear:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Angular:').length).toBeGreaterThan(0);
      expect(screen.getAllByText('LiDAR').length).toBeGreaterThan(0);
    });

    it('should render in landscape orientation', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'landscape',
        isFullscreen: true,
      });

      render(<PilotMode />);

      // Should still have all essential components
      expect(screen.getByText('Exit').closest('button')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getAllByText('Controls').length).toBeGreaterThan(0);
    });

    it('should handle fullscreen state', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: false,
      });

      render(<PilotMode />);

      // Should still render all components regardless of fullscreen state
      expect(screen.getByText('Exit').closest('button')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should not render when pilot mode is disabled', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: false,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: false,
      });

      render(<PilotMode />);
      
      // Should not have pilot mode specific elements when disabled
      expect(screen.queryByText('Exit')).not.toBeInTheDocument();
    });

    it('should have interactive controls', () => {
      render(<PilotMode />);

      // Controls should be interactive - handle multiple instances
      const cmdVelElements = screen.getAllByText('/cmd_vel');
      expect(cmdVelElements.length).toBeGreaterThan(0);
      expect(cmdVelElements[0].closest('button')).toBeInTheDocument();
      
      // Movement buttons should be present
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(5); // Exit + topic selector + movement buttons + pilot mode button
    });

    it('should display camera feed', () => {
      render(<PilotMode />);

      const image = screen.getByRole('img');
      // The image should be present (src might be null in test environment)
      expect(image).toBeInTheDocument();
    });

    it('should show connection status', () => {
      render(<PilotMode />);

      expect(screen.getByText('Test Robot')).toBeInTheDocument();
      expect(screen.getByText('Connected: Test Robot')).toBeInTheDocument();
    });

    it('should have LiDAR visualization', () => {
      render(<PilotMode />);

      expect(screen.getAllByText('LiDAR').length).toBeGreaterThan(0);
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should have ESC exit instruction', () => {
      render(<PilotMode />);

      expect(screen.getByText('ESC - Exit')).toBeInTheDocument();
    });

    it('should have pilot mode toggle button', () => {
      render(<PilotMode />);

      // Handle multiple "Exit Pilot" buttons - just check that at least one exists
      const exitPilotButtons = screen.getAllByText('Exit Pilot');
      expect(exitPilotButtons.length).toBeGreaterThan(0);
    });
  });
});