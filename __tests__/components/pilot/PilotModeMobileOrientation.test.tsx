import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@/test-utils';
import userEvent from '@testing-library/user-event';
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
vi.mock('@/components/dashboard/ConnectionProvider');
vi.mock('@/components/pilot/usePilotMode');
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
const mockUsePilotMode = usePilotMode as vi.MockedFunction<typeof usePilotMode>;

// Mock fullscreen API
const mockFullscreenAPI = {
  requestFullscreen: vi.fn(),
  exitFullscreen: vi.fn(),
  fullscreenElement: null,
};

// Mock screen orientation API
const mockScreenOrientationAPI = {
  lock: vi.fn(),
  unlock: vi.fn(),
  orientation: {
    type: 'portrait-primary',
    angle: 0,
  },
};

describe('PilotMode Mobile Orientation', () => {
  beforeEach(() => {
    setupRosConnectionMocks();
    mockUseConnection.mockReturnValue(createMockConnectionContext());
    
    // Mock fullscreen API
    Object.defineProperty(document, 'documentElement', {
      value: {
        requestFullscreen: mockFullscreenAPI.requestFullscreen,
      },
      writable: true,
    });
    
    Object.defineProperty(document, 'exitFullscreen', {
      value: mockFullscreenAPI.exitFullscreen,
      writable: true,
    });
    
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => mockFullscreenAPI.fullscreenElement,
      configurable: true,
    });
    
    // Mock screen orientation API
    Object.defineProperty(window, 'screen', {
      value: {
        orientation: mockScreenOrientationAPI,
      },
      writable: true,
    });
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });
    
    // Mock matchMedia for orientation
    window.matchMedia = vi.fn((query) => ({
      matches: query === '(orientation: landscape)' ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanupRosConnectionMocks();
    vi.clearAllMocks();
  });

  describe('Portrait Orientation', () => {
    beforeEach(() => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });
    });

    it('should render properly in portrait mode', () => {
      render(<PilotMode />);

      // Container should have proper classes for portrait
      const pilotContainer = document.querySelector('.fixed.inset-0.z-50');
      expect(pilotContainer).toHaveClass('mobile-fullscreen');
      expect(pilotContainer).toHaveClass('mobile-safe-area');
      expect(pilotContainer).not.toHaveClass('mobile-landscape-layout');
    });

    it('should position UI elements correctly in portrait mode', () => {
      render(<PilotMode />);

      // Exit button should be in correct position
      const exitButton = screen.getByRole('button', { name: /exit|✕/i });
      expect(exitButton).toHaveClass('top-2');
      expect(exitButton).toHaveClass('left-2');
      expect(exitButton).toHaveClass('mobile-safe-area-top');
      expect(exitButton).toHaveClass('mobile-safe-area-left');

      // Status bar should be positioned correctly
      const statusElements = document.querySelectorAll('[class*="top-2"]');
      expect(statusElements.length).toBeGreaterThan(0);

      // HUD panel should be at bottom
      const hudPanel = document.querySelector('[class*="bottom-0"]');
      expect(hudPanel).toBeInTheDocument();
    });

    it('should use correct crosshair size in portrait mode', () => {
      render(<PilotMode />);

      const crosshair = document.querySelector('.absolute.top-1\\/2.left-1\\/2');
      const crosshairInner = crosshair?.firstElementChild;
      
      expect(crosshairInner).toHaveClass('w-8');
      expect(crosshairInner).toHaveClass('h-8');
    });

    it('should use normal LiDAR height in portrait mode', () => {
      render(<PilotMode />);

      const lidarContainer = document.querySelector('[class*="h-32"]');
      expect(lidarContainer).toBeInTheDocument();
      expect(lidarContainer).toHaveClass('h-32');
    });
  });

  describe('Landscape Orientation', () => {
    beforeEach(() => {
      // Set landscape dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      });

      // Mock landscape orientation
      window.matchMedia = vi.fn((query) => ({
        matches: query === '(orientation: landscape)' ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'landscape',
        isFullscreen: true,
      });
    });

    it('should render properly in landscape mode', () => {
      render(<PilotMode />);

      // Container should have landscape layout class
      const pilotContainer = document.querySelector('.fixed.inset-0.z-50');
      expect(pilotContainer).toHaveClass('mobile-landscape-layout');
      expect(pilotContainer).toHaveClass('mobile-fullscreen');
      expect(pilotContainer).toHaveClass('mobile-safe-area');
    });

    it('should position UI elements correctly in landscape mode', () => {
      render(<PilotMode />);

      // Exit button should be in tighter position
      const exitButton = screen.getByRole('button', { name: /exit|✕/i });
      expect(exitButton).toHaveClass('top-1');
      expect(exitButton).toHaveClass('left-1');
      expect(exitButton).toHaveClass('mobile-safe-area-top');
      expect(exitButton).toHaveClass('mobile-safe-area-left');

      // Status bar should be repositioned
      const statusElements = document.querySelectorAll('[class*="top-1"]');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should use smaller crosshair in landscape mode', () => {
      render(<PilotMode />);

      const crosshair = document.querySelector('.absolute.top-1\\/2.left-1\\/2');
      const crosshairInner = crosshair?.firstElementChild;
      
      expect(crosshairInner).toHaveClass('w-6');
      expect(crosshairInner).toHaveClass('h-6');
    });

    it('should use compact LiDAR height in landscape mode', () => {
      render(<PilotMode />);

      const lidarContainer = document.querySelector('[class*="h-20"]');
      expect(lidarContainer).toBeInTheDocument();
      expect(lidarContainer).toHaveClass('h-20');
    });

    it('should apply mobile-hud-bottom class in landscape mode', () => {
      render(<PilotMode />);

      const hudPanel = document.querySelector('.mobile-hud-bottom');
      expect(hudPanel).toBeInTheDocument();
      expect(hudPanel).toHaveClass('mobile-safe-area-bottom');
      expect(hudPanel).toHaveClass('mobile-safe-area-right');
    });
  });

  describe('Orientation Change Handling', () => {
    it('should handle orientation change from portrait to landscape', async () => {
      const mockOrientationChange = vi.fn();
      
      // Start in portrait
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      const { rerender } = render(<PilotMode />);

      // Verify portrait layout initially
      expect(document.querySelector('.mobile-landscape-layout')).not.toBeInTheDocument();

      // Change to landscape
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'landscape',
        isFullscreen: true,
      });

      rerender(<PilotMode />);

      // Verify landscape layout
      const pilotContainer = document.querySelector('.fixed.inset-0.z-50');
      expect(pilotContainer).toHaveClass('mobile-landscape-layout');
    });

    it('should handle orientation change from landscape to portrait', async () => {
      // Start in landscape
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'landscape',
        isFullscreen: true,
      });

      const { rerender } = render(<PilotMode />);

      // Verify landscape layout initially
      expect(document.querySelector('.mobile-landscape-layout')).toBeInTheDocument();

      // Change to portrait
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      rerender(<PilotMode />);

      // Verify portrait layout
      const pilotContainer = document.querySelector('.fixed.inset-0.z-50');
      expect(pilotContainer).not.toHaveClass('mobile-landscape-layout');
    });
  });

  describe('Fullscreen Behavior', () => {
    it('should apply mobile-fullscreen class when in fullscreen', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      render(<PilotMode />);

      const pilotContainer = document.querySelector('.fixed.inset-0.z-50');
      expect(pilotContainer).toHaveClass('mobile-fullscreen');
    });

    it('should not apply mobile-fullscreen class when not in fullscreen', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: false,
      });

      render(<PilotMode />);

      const pilotContainer = document.querySelector('.fixed.inset-0.z-50');
      expect(pilotContainer).not.toHaveClass('mobile-fullscreen');
    });
  });

  describe('Safe Area Handling', () => {
    it('should apply safe area classes to UI elements', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      render(<PilotMode />);

      // Exit button should have safe area classes
      const exitButton = screen.getByRole('button', { name: /exit|✕/i });
      expect(exitButton).toHaveClass('mobile-safe-area-top');
      expect(exitButton).toHaveClass('mobile-safe-area-left');

      // Container should have general safe area class
      const pilotContainer = document.querySelector('.fixed.inset-0.z-50');
      expect(pilotContainer).toHaveClass('mobile-safe-area');
    });

    it('should apply safe area classes to status bar', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      render(<PilotMode />);

      const statusBar = document.querySelector('[class*="mobile-safe-area-top"][class*="mobile-safe-area-right"]');
      expect(statusBar).toBeInTheDocument();
    });

    it('should apply safe area classes to HUD panel', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      render(<PilotMode />);

      const hudPanel = document.querySelector('[class*="mobile-safe-area-bottom"]');
      expect(hudPanel).toBeInTheDocument();
    });
  });

  describe('Touch Interface Optimization', () => {
    it('should have touch-manipulation class on exit button', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      render(<PilotMode />);

      const exitButton = screen.getByRole('button', { name: /exit|✕/i });
      expect(exitButton).toHaveClass('touch-manipulation');
    });

    it('should have minimum touch target size for exit button', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      render(<PilotMode />);

      const exitButton = screen.getByRole('button', { name: /exit|✕/i });
      expect(exitButton).toHaveClass('min-h-[32px]');
      expect(exitButton).toHaveClass('min-w-[32px]');
    });
  });

  describe('Responsive Text and Icons', () => {
    it('should show X symbol on mobile devices', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      render(<PilotMode />);

      const mobileExitSymbol = screen.getByText('✕');
      expect(mobileExitSymbol).toBeInTheDocument();
      expect(mobileExitSymbol).toHaveClass('sm:hidden');
    });

    it('should hide "Exit" text on mobile devices', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'portrait',
        isFullscreen: true,
      });

      render(<PilotMode />);

      const exitText = screen.getByText('Exit');
      expect(exitText).toHaveClass('hidden');
      expect(exitText).toHaveClass('sm:inline');
    });
  });

  describe('Camera Integration', () => {
    it('should pass orientation and fullscreen state to camera component', () => {
      mockUsePilotMode.mockReturnValue({
        isPilotMode: true,
        enterPilotMode: vi.fn(),
        exitPilotMode: vi.fn(),
        orientation: 'landscape',
        isFullscreen: true,
      });

      render(<PilotMode />);

      // Camera container should be present
      const cameraContainer = document.querySelector('.mobile-camera-container');
      expect(cameraContainer).toBeInTheDocument();
    });
  });
});