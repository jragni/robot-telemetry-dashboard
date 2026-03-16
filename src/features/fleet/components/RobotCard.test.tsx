import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RobotCard } from './RobotCard';

import type { RobotStatus } from '@/features/fleet/fleet.types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockConnectRobot = vi.fn();
const mockDisconnectRobot = vi.fn();

vi.mock('@/features/fleet/hooks/useFleetConnectionManager', () => ({
  useFleetConnectionManager: vi.fn(() => ({
    connectAll: vi.fn(),
    disconnectAll: vi.fn(),
    connectRobot: mockConnectRobot,
    disconnectRobot: mockDisconnectRobot,
  })),
}));

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

vi.mock('@/stores/control/control.store', () => ({
  useControlStore: Object.assign(
    vi.fn((selector: (s: unknown) => unknown) =>
      selector({
        getControlState: vi.fn(() => ({
          linearVelocity: 0.5,
          angularVelocity: 0.5,
          selectedTopic: '/cmd_vel',
          isEStopActive: false,
        })),
      })
    ),
    {
      getState: vi.fn(() => ({
        activateEStop: vi.fn(),
        deactivateEStop: vi.fn(),
        getControlState: vi.fn(() => ({
          linearVelocity: 0.5,
          angularVelocity: 0.5,
          selectedTopic: '/cmd_vel',
          isEStopActive: false,
        })),
      })),
    }
  ),
  DEFAULT_CONTROL_STATE: {
    linearVelocity: 0.5,
    angularVelocity: 0.5,
    selectedTopic: '/cmd_vel',
    isEStopActive: false,
  },
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const disconnectedStatus: RobotStatus = {
  robot: {
    id: 'robot-1',
    name: 'Alpha',
    baseUrl: 'ws://alpha:9090',
    createdAt: 1000,
  },
  rosState: 'disconnected',
  webrtcState: 'disconnected',
  isConnected: false,
  controlState: {
    linearVelocity: 0.5,
    angularVelocity: 0.5,
    isEStopActive: false,
  },
};

const connectedStatus: RobotStatus = {
  ...disconnectedStatus,
  rosState: 'connected',
  webrtcState: 'connected',
  isConnected: true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderCard(status: RobotStatus) {
  return render(
    <MemoryRouter>
      <RobotCard status={status} />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RobotCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Content rendering
  // -------------------------------------------------------------------------

  describe('content rendering', () => {
    it('renders the robot name', () => {
      renderCard(disconnectedStatus);

      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    it('renders the robot base URL', () => {
      renderCard(disconnectedStatus);

      expect(screen.getByText('ws://alpha:9090')).toBeInTheDocument();
    });

    it('renders the ROS status label', () => {
      renderCard(disconnectedStatus);

      expect(screen.getByText('ROS')).toBeInTheDocument();
    });

    it('renders the VIDEO status label', () => {
      renderCard(disconnectedStatus);

      expect(screen.getByText('VIDEO')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Connect / Disconnect button
  // -------------------------------------------------------------------------

  describe('connect button', () => {
    it('shows a Connect button when the robot is disconnected', () => {
      renderCard(disconnectedStatus);

      expect(
        screen.getByRole('button', { name: /connect/i })
      ).toBeInTheDocument();
    });

    it('shows a Disconnect button when the robot is connected', () => {
      renderCard(connectedStatus);

      expect(
        screen.getByRole('button', { name: /disconnect/i })
      ).toBeInTheDocument();
    });

    it('calls connectRobot with the robot id when Connect is clicked', () => {
      renderCard(disconnectedStatus);

      fireEvent.click(screen.getByRole('button', { name: /connect/i }));

      expect(mockConnectRobot).toHaveBeenCalledWith('robot-1');
    });

    it('calls disconnectRobot with the robot id when Disconnect is clicked', () => {
      renderCard(connectedStatus);

      fireEvent.click(screen.getByRole('button', { name: /disconnect/i }));

      expect(mockDisconnectRobot).toHaveBeenCalledWith('robot-1');
    });
  });

  // -------------------------------------------------------------------------
  // Pilot button
  // -------------------------------------------------------------------------

  describe('pilot button', () => {
    it('renders the Pilot button', () => {
      renderCard(disconnectedStatus);

      expect(
        screen.getByRole('button', { name: /pilot/i })
      ).toBeInTheDocument();
    });

    it('navigates to /pilot/:robotId when Pilot is clicked', () => {
      renderCard(disconnectedStatus);

      fireEvent.click(screen.getByRole('button', { name: /pilot/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/pilot/robot-1');
    });
  });

  // -------------------------------------------------------------------------
  // E-Stop (connected only)
  // -------------------------------------------------------------------------

  describe('e-stop', () => {
    it('shows E-Stop button when robot is connected', () => {
      renderCard(connectedStatus);

      expect(
        screen.getByRole('button', { name: /e-stop/i })
      ).toBeInTheDocument();
    });

    it('does not show E-Stop button when robot is not connected', () => {
      renderCard(disconnectedStatus);

      expect(
        screen.queryByRole('button', { name: /e-stop/i })
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Velocity readout (connected only)
  // -------------------------------------------------------------------------

  describe('velocity readout', () => {
    it('shows velocity readout when robot is connected', () => {
      renderCard(connectedStatus);

      // LIN and ANG labels should appear in compact velocity display
      expect(screen.getByText('LIN')).toBeInTheDocument();
      expect(screen.getByText('ANG')).toBeInTheDocument();
    });

    it('does not show velocity readout when robot is not connected', () => {
      renderCard(disconnectedStatus);

      expect(screen.queryByText('LIN')).not.toBeInTheDocument();
    });
  });
});
