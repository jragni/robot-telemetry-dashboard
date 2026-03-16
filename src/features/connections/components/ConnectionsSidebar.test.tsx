import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ConnectionsSidebar } from './ConnectionsSidebar';

// ---------------------------------------------------------------------------
// Hoisted mocks (vi.hoisted runs before vi.mock factory hoisting)
// ---------------------------------------------------------------------------

const {
  mockConnectRobot,
  mockDisconnectRobot,
  mockRemoveRobot,
  mockSetActiveRobot,
  mockStoreState,
  mockUseConnectionsStore,
} = vi.hoisted(() => {
  const mockConnectRobot = vi.fn();
  const mockDisconnectRobot = vi.fn();
  const mockRemoveRobot = vi.fn();
  const mockSetActiveRobot = vi.fn();

  const ROBOTS = [
    {
      id: 'robot-1',
      name: 'Alpha',
      baseUrl: 'ws://alpha:9090',
      createdAt: 1000,
    },
    {
      id: 'robot-2',
      name: 'Bravo',
      baseUrl: 'ws://bravo:9090',
      createdAt: 2000,
    },
  ];

  // Mutable state controlled by individual tests.
  let mockRobots = ROBOTS;
  let mockActiveRobotId: string | null = 'robot-1';

  const mockStoreState = {
    get robots() {
      return mockRobots;
    },
    get activeRobotId() {
      return mockActiveRobotId;
    },
    setRobots(r: typeof ROBOTS) {
      mockRobots = r;
    },
    setActiveRobotIdForTest(id: string | null) {
      mockActiveRobotId = id;
    },
    setActiveRobot: mockSetActiveRobot,
    removeRobot: mockRemoveRobot,
    addRobot: vi.fn(() => 'new-robot-id'),
  };

  const mockUseConnectionsStore = Object.assign(
    vi.fn((selector: (s: unknown) => unknown) => selector(mockStoreState)),
    { getState: vi.fn(() => mockStoreState) }
  );

  return {
    mockConnectRobot,
    mockDisconnectRobot,
    mockRemoveRobot,
    mockSetActiveRobot,
    mockStoreState,
    mockUseConnectionsStore,
  };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@/features/fleet/hooks/useFleetConnectionManager', () => ({
  useFleetConnectionManager: vi.fn(() => ({
    connectAll: vi.fn(),
    disconnectAll: vi.fn(),
    connectRobot: mockConnectRobot,
    disconnectRobot: mockDisconnectRobot,
  })),
}));

vi.mock('@/stores/connections/connections.store', () => ({
  useConnectionsStore: mockUseConnectionsStore,
}));

vi.mock('@/stores/ros.store', () => ({
  useRosStore: vi.fn((selector: (s: unknown) => unknown) =>
    selector({
      getConnectionState: vi.fn((id: string) =>
        id === 'robot-1' ? 'connected' : 'disconnected'
      ),
    })
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderSidebar() {
  return render(
    <MemoryRouter>
      <ConnectionsSidebar />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ConnectionsSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.setActiveRobotIdForTest('robot-1');
    mockStoreState.setRobots([
      {
        id: 'robot-1',
        name: 'Alpha',
        baseUrl: 'ws://alpha:9090',
        createdAt: 1000,
      },
      {
        id: 'robot-2',
        name: 'Bravo',
        baseUrl: 'ws://bravo:9090',
        createdAt: 2000,
      },
    ]);
  });

  // -------------------------------------------------------------------------
  // Robot list rendering
  // -------------------------------------------------------------------------

  describe('robot list rendering', () => {
    it('renders all configured robot names', () => {
      renderSidebar();

      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Bravo')).toBeInTheDocument();
    });

    it('renders the base URL for each robot', () => {
      renderSidebar();

      expect(screen.getByText('ws://alpha:9090')).toBeInTheDocument();
      expect(screen.getByText('ws://bravo:9090')).toBeInTheDocument();
    });

    it('shows a placeholder message when there are no robots', () => {
      mockStoreState.setRobots([]);

      renderSidebar();

      expect(screen.getByText(/no robots configured/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Active robot highlight
  // -------------------------------------------------------------------------

  describe('active robot', () => {
    it('marks the active robot row with data-testid', () => {
      renderSidebar();

      // The active robot row should exist in the DOM.
      expect(screen.getByTestId('robot-row-robot-1')).toBeInTheDocument();
    });

    it('calls setActiveRobot when a robot row is clicked', () => {
      renderSidebar();

      fireEvent.click(screen.getByTestId('robot-row-robot-2'));

      expect(mockSetActiveRobot).toHaveBeenCalledWith('robot-2');
    });
  });

  // -------------------------------------------------------------------------
  // Connect / Disconnect buttons
  // -------------------------------------------------------------------------

  describe('connect/disconnect buttons', () => {
    it('shows Disconnect button for a connected robot', () => {
      renderSidebar();

      // Alpha (robot-1) is connected per the mock.
      expect(
        screen.getByRole('button', { name: /disconnect alpha/i })
      ).toBeInTheDocument();
    });

    it('calls disconnectRobot when Disconnect is clicked', () => {
      renderSidebar();

      fireEvent.click(
        screen.getByRole('button', { name: /disconnect alpha/i })
      );

      expect(mockDisconnectRobot).toHaveBeenCalledWith('robot-1');
    });

    it('shows Connect button for a disconnected robot', () => {
      renderSidebar();

      // Bravo (robot-2) is disconnected per the mock.
      expect(
        screen.getByRole('button', { name: /connect bravo/i })
      ).toBeInTheDocument();
    });

    it('calls connectRobot when Connect is clicked', () => {
      renderSidebar();

      fireEvent.click(screen.getByRole('button', { name: /connect bravo/i }));

      expect(mockConnectRobot).toHaveBeenCalledWith('robot-2');
    });
  });

  // -------------------------------------------------------------------------
  // Delete flow
  // -------------------------------------------------------------------------

  describe('delete robot', () => {
    it('opens the confirmation dialog when the delete button is clicked', () => {
      renderSidebar();

      fireEvent.click(screen.getByRole('button', { name: /delete alpha/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/remove robot/i)).toBeInTheDocument();
    });

    it('calls disconnectRobot and removeRobot on confirm', () => {
      renderSidebar();

      fireEvent.click(screen.getByRole('button', { name: /delete alpha/i }));
      fireEvent.click(screen.getByRole('button', { name: /^remove$/i }));

      expect(mockDisconnectRobot).toHaveBeenCalledWith('robot-1');
      expect(mockRemoveRobot).toHaveBeenCalledWith('robot-1');
    });

    it('closes the dialog on cancel without deleting', () => {
      renderSidebar();

      fireEvent.click(screen.getByRole('button', { name: /delete alpha/i }));
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockRemoveRobot).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Add Robot form
  // -------------------------------------------------------------------------

  describe('add robot form', () => {
    it('renders the Add Robot form', () => {
      renderSidebar();

      expect(
        screen.getByRole('form', { name: /add robot/i })
      ).toBeInTheDocument();
    });

    it('renders name and URL inputs', () => {
      renderSidebar();

      expect(
        screen.getByRole('textbox', { name: /robot name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /base url/i })
      ).toBeInTheDocument();
    });
  });
});
