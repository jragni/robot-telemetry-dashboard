import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ControlPad } from './ControlPad';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPublish = vi.fn();
const mockActivateEStop = vi.fn();

vi.mock('../hooks/useControlPublisher', () => ({
  useControlPublisher: vi.fn(() => ({
    publish: mockPublish,
    isReady: true,
  })),
}));

const mockStoreState = {
  robotControls: {},
  activateEStop: mockActivateEStop,
  deactivateEStop: vi.fn(),
  getControlState: vi.fn(() => ({
    linearVelocity: 0.5,
    angularVelocity: 0.5,
    selectedTopic: '/cmd_vel',
    isEStopActive: false,
  })),
  setLinearVelocity: vi.fn(),
  setAngularVelocity: vi.fn(),
  setSelectedTopic: vi.fn(),
};

vi.mock('@/stores/control/control.store', () => ({
  useControlStore: Object.assign(
    vi.fn((selector: (s: unknown) => unknown) => selector(mockStoreState)),
    {
      getState: vi.fn(() => mockStoreState),
    }
  ),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const ROBOT_ID = 'robot-001';

describe('ControlPad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe('rendering', () => {
    it('renders all 5 control buttons', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      expect(
        screen.getByRole('button', { name: /forward/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /backward/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /left/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /right/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /e.?stop/i })
      ).toBeInTheDocument();
    });

    it('forward button has correct accessible label', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      const forwardBtn = screen.getByRole('button', { name: /forward/i });
      expect(forwardBtn).toBeInTheDocument();
      // The accessible name must contain "forward" (case-insensitive)
      expect(
        forwardBtn.getAttribute('aria-label') ?? forwardBtn.textContent
      ).toMatch(/forward/i);
    });

    it('e-stop button has destructive styling class', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      const eStopBtn = screen.getByRole('button', { name: /e.?stop/i });
      // data-variant="destructive" is set by the Button component
      expect(eStopBtn).toHaveAttribute('data-variant', 'destructive');
    });
  });

  // -------------------------------------------------------------------------
  // Interaction — mouseDown / mouseUp
  // -------------------------------------------------------------------------

  describe('mouse interactions', () => {
    it('publishes "forward" on mouseDown of forward button', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      fireEvent.mouseDown(screen.getByRole('button', { name: /forward/i }));

      expect(mockPublish).toHaveBeenCalledWith('forward');
    });

    it('publishes "stop" on mouseUp of forward button', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      fireEvent.mouseDown(screen.getByRole('button', { name: /forward/i }));
      fireEvent.mouseUp(screen.getByRole('button', { name: /forward/i }));

      expect(mockPublish).toHaveBeenLastCalledWith('stop');
    });

    it('publishes "backward" on mouseDown of backward button', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      fireEvent.mouseDown(screen.getByRole('button', { name: /backward/i }));

      expect(mockPublish).toHaveBeenCalledWith('backward');
    });

    it('publishes "left" on mouseDown of left button', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      fireEvent.mouseDown(screen.getByRole('button', { name: /left/i }));

      expect(mockPublish).toHaveBeenCalledWith('left');
    });

    it('publishes "right" on mouseDown of right button', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      fireEvent.mouseDown(screen.getByRole('button', { name: /right/i }));

      expect(mockPublish).toHaveBeenCalledWith('right');
    });
  });

  // -------------------------------------------------------------------------
  // E-Stop
  // -------------------------------------------------------------------------

  describe('e-stop', () => {
    it('calls activateEStop on the store when e-stop is pressed', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      fireEvent.mouseDown(screen.getByRole('button', { name: /e.?stop/i }));

      expect(mockActivateEStop).toHaveBeenCalledWith(ROBOT_ID);
    });

    it('publishes "stop" when e-stop is pressed', () => {
      render(<ControlPad robotId={ROBOT_ID} />);

      fireEvent.mouseDown(screen.getByRole('button', { name: /e.?stop/i }));

      expect(mockPublish).toHaveBeenCalledWith('stop');
    });
  });
});
