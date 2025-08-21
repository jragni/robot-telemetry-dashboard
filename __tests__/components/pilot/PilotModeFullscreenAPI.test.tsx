import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { PilotModeProvider, usePilotMode } from '@/components/pilot/usePilotMode';
import { 
  mockROSLIB, 
  setupRosConnectionMocks, 
  cleanupRosConnectionMocks,
  createMockConnectionContext
} from '@/test-utils';
import { useConnection } from '@/components/dashboard/ConnectionProvider';

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

const mockUseConnection = useConnection as vi.MockedFunction<typeof useConnection>;

// Mock fullscreen API
const mockFullscreenAPI = {
  requestFullscreen: vi.fn(),
  exitFullscreen: vi.fn(),
  fullscreenElement: null,
  fullscreenchange: new Event('fullscreenchange'),
  visibilitychange: new Event('visibilitychange'),
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

// Test component that uses the pilot mode hook
function TestComponent() {
  const { isPilotMode, enterPilotMode, exitPilotMode, orientation, isFullscreen } = usePilotMode();
  
  return (
    <div>
      <div data-testid="pilot-mode-status">{isPilotMode ? 'active' : 'inactive'}</div>
      <div data-testid="orientation-status">{orientation}</div>
      <div data-testid="fullscreen-status">{isFullscreen ? 'fullscreen' : 'windowed'}</div>
      <button onClick={enterPilotMode} data-testid="enter-pilot">Enter Pilot Mode</button>
      <button onClick={exitPilotMode} data-testid="exit-pilot">Exit Pilot Mode</button>
    </div>
  );
}

describe('PilotMode Fullscreen API Integration', () => {
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
    
    Object.defineProperty(document, 'hidden', {
      get: () => false,
      configurable: true,
    });
    
    // Mock screen orientation API
    Object.defineProperty(window, 'screen', {
      value: {
        orientation: mockScreenOrientationAPI,
      },
      writable: true,
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
    
    // Reset mocks
    mockFullscreenAPI.requestFullscreen.mockClear();
    mockFullscreenAPI.exitFullscreen.mockClear();
    mockScreenOrientationAPI.lock.mockClear();
    mockScreenOrientationAPI.unlock.mockClear();
    mockFullscreenAPI.fullscreenElement = null;
  });

  afterEach(() => {
    cleanupRosConnectionMocks();
    vi.clearAllMocks();
  });

  describe('Entering Pilot Mode', () => {
    it('should request fullscreen when entering pilot mode', async () => {
      mockFullscreenAPI.requestFullscreen.mockResolvedValue(undefined);
      mockScreenOrientationAPI.lock.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(mockFullscreenAPI.requestFullscreen).toHaveBeenCalled();
      });
    });

    it('should attempt to lock screen orientation to landscape', async () => {
      mockFullscreenAPI.requestFullscreen.mockResolvedValue(undefined);
      mockScreenOrientationAPI.lock.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(mockScreenOrientationAPI.lock).toHaveBeenCalledWith('landscape');
      });
    });

    it('should fallback to "any" orientation if landscape lock fails', async () => {
      mockFullscreenAPI.requestFullscreen.mockResolvedValue(undefined);
      mockScreenOrientationAPI.lock
        .mockRejectedValueOnce(new Error('Landscape not supported'))
        .mockResolvedValueOnce(undefined);
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(mockScreenOrientationAPI.lock).toHaveBeenCalledWith('landscape');
        expect(mockScreenOrientationAPI.lock).toHaveBeenCalledWith('any');
      });
    });

    it('should still enable pilot mode if fullscreen request fails', async () => {
      // Suppress console errors for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFullscreenAPI.requestFullscreen.mockRejectedValue(new Error('Fullscreen not supported'));
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
        expect(screen.getByText('windowed')).toBeInTheDocument();
      });
      
      consoleError.mockRestore();
    });

    it('should set fullscreen state correctly when fullscreen succeeds', async () => {
      mockFullscreenAPI.requestFullscreen.mockResolvedValue(undefined);
      mockFullscreenAPI.fullscreenElement = document.documentElement;
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
        expect(screen.getByText('fullscreen')).toBeInTheDocument();
      });
    });

    it('should handle orientation lock failure gracefully', async () => {
      // Suppress console errors for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFullscreenAPI.requestFullscreen.mockResolvedValue(undefined);
      mockScreenOrientationAPI.lock.mockRejectedValue(new Error('Orientation lock not supported'));
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });
      
      consoleError.mockRestore();
    });
  });

  describe('Exiting Pilot Mode', () => {
    it('should exit fullscreen when exiting pilot mode', async () => {
      mockFullscreenAPI.exitFullscreen.mockResolvedValue(undefined);
      mockScreenOrientationAPI.unlock.mockResolvedValue(undefined);
      mockFullscreenAPI.fullscreenElement = document.documentElement;
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      // First enter pilot mode
      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });

      // Then exit pilot mode
      const exitButton = screen.getByText('Exit Pilot Mode');
      await user.click(exitButton);

      await waitFor(() => {
        expect(mockFullscreenAPI.exitFullscreen).toHaveBeenCalled();
      });
    });

    it('should unlock screen orientation when exiting pilot mode', async () => {
      mockFullscreenAPI.exitFullscreen.mockResolvedValue(undefined);
      mockScreenOrientationAPI.unlock.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      // First enter pilot mode
      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });

      // Then exit pilot mode
      const exitButton = screen.getByText('Exit Pilot Mode');
      await user.click(exitButton);

      await waitFor(() => {
        expect(mockScreenOrientationAPI.unlock).toHaveBeenCalled();
      });
    });

    it('should still exit pilot mode if fullscreen exit fails', async () => {
      mockFullscreenAPI.exitFullscreen.mockRejectedValue(new Error('Exit fullscreen failed'));
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      // First enter pilot mode
      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });

      // Then exit pilot mode
      const exitButton = screen.getByText('Exit Pilot Mode');
      await user.click(exitButton);

      await waitFor(() => {
        expect(screen.getByText('inactive')).toBeInTheDocument();
        expect(screen.getByText('windowed')).toBeInTheDocument();
      });
    });
  });

  describe('Fullscreen Change Events', () => {
    it('should handle fullscreen change events', async () => {
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      // Enter pilot mode
      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });

      // Simulate fullscreen change event (user exits fullscreen via browser)
      mockFullscreenAPI.fullscreenElement = null;
      
      act(() => {
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      await waitFor(() => {
        expect(screen.getByText('inactive')).toBeInTheDocument();
        expect(screen.getByText('windowed')).toBeInTheDocument();
      });
    });

    it('should update fullscreen state on fullscreen change', async () => {
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      // Start with pilot mode active
      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      // Simulate entering fullscreen
      mockFullscreenAPI.fullscreenElement = document.documentElement;
      
      act(() => {
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      await waitFor(() => {
        expect(screen.getByText('fullscreen')).toBeInTheDocument();
      });

      // Simulate exiting fullscreen
      mockFullscreenAPI.fullscreenElement = null;
      
      act(() => {
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      await waitFor(() => {
        expect(screen.getByText('windowed')).toBeInTheDocument();
      });
    });
  });

  describe('Visibility Change Events', () => {
    it('should handle visibility change without exiting pilot mode', async () => {
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      // Enter pilot mode
      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });

      // Simulate page becoming hidden (app switching on mobile)
      Object.defineProperty(document, 'hidden', {
        get: () => true,
        configurable: true,
      });
      
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Should still be in pilot mode but update fullscreen state
      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Events', () => {
    it('should exit pilot mode on Escape key', async () => {
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      // Enter pilot mode
      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });

      // Press Escape key
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.getByText('inactive')).toBeInTheDocument();
      });
    });

    it('should not exit pilot mode on other keys', async () => {
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      // Enter pilot mode
      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });

      // Press other keys
      await user.keyboard('{Space}');
      await user.keyboard('{Enter}');
      await user.keyboard('a');

      // Should still be in pilot mode
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  describe('Orientation Detection', () => {
    it('should detect portrait orientation correctly', () => {
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

      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      expect(screen.getByText('portrait')).toBeInTheDocument();
    });

    it('should detect landscape orientation correctly', () => {
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

      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      expect(screen.getByText('landscape')).toBeInTheDocument();
    });

    it('should handle orientation change events', async () => {
      const mockMediaQuery = {
        matches: false,
        media: '(orientation: landscape)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };

      window.matchMedia = vi.fn(() => mockMediaQuery);

      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      expect(screen.getByText('portrait')).toBeInTheDocument();

      // Simulate orientation change to landscape
      mockMediaQuery.matches = true;
      
      act(() => {
        const changeCallback = mockMediaQuery.addEventListener.mock.calls.find(
          call => call[0] === 'change'
        )?.[1];
        if (changeCallback) {
          changeCallback();
        }
      });

      await waitFor(() => {
        expect(screen.getByText('landscape')).toBeInTheDocument();
      });
    });
  });

  describe('Browser Compatibility', () => {
    it('should handle missing fullscreen API gracefully', async () => {
      // Remove fullscreen API
      Object.defineProperty(document, 'documentElement', {
        value: {},
        writable: true,
      });
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
        expect(screen.getByText('windowed')).toBeInTheDocument();
      });
    });

    it('should handle missing screen orientation API gracefully', async () => {
      // Remove screen orientation API
      Object.defineProperty(window, 'screen', {
        value: {},
        writable: true,
      });
      
      const user = userEvent.setup();
      
      render(
        <PilotModeProvider>
          <TestComponent />
        </PilotModeProvider>
      );

      const enterButton = screen.getByText('Enter Pilot Mode');
      await user.click(enterButton);

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument();
      });
    });
  });
});