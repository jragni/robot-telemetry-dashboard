import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { PilotControls } from './PilotControls';
import type { PilotControlsProps } from '../../types/PilotPage.types';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {
      /* noop */
    }
    unobserve() {
      /* noop */
    }
    disconnect() {
      /* noop */
    }
  };
});

function buildProps(overrides: Partial<PilotControlsProps> = {}): PilotControlsProps {
  return {
    angularVelocity: 0.5,
    connected: true,
    isFullscreen: false,
    linearVelocity: 0.3,
    onAngularVelocityChange: vi.fn(),
    onDirectionEnd: vi.fn(),
    onDirectionStart: vi.fn(),
    onEmergencyStop: vi.fn(),
    onLinearVelocityChange: vi.fn(),
    ...overrides,
  };
}

describe('PilotControls', () => {
  describe('Reconnect button', () => {
    it('renders Reconnect when !connected and onReconnect provided', () => {
      const onReconnect = vi.fn();
      render(<PilotControls {...buildProps({ connected: false, onReconnect })} />);
      expect(screen.getByLabelText('Reconnect to robot')).toBeInTheDocument();
    });

    it('does not render Reconnect when connected', () => {
      const onReconnect = vi.fn();
      render(<PilotControls {...buildProps({ connected: true, onReconnect })} />);
      expect(screen.queryByLabelText('Reconnect to robot')).not.toBeInTheDocument();
    });

    it('does not render Reconnect when onReconnect is undefined', () => {
      render(<PilotControls {...buildProps({ connected: false })} />);
      expect(screen.queryByLabelText('Reconnect to robot')).not.toBeInTheDocument();
    });

    it('calls onReconnect when Reconnect is clicked', () => {
      const onReconnect = vi.fn();
      render(<PilotControls {...buildProps({ connected: false, onReconnect })} />);
      fireEvent.click(screen.getByLabelText('Reconnect to robot'));
      expect(onReconnect).toHaveBeenCalledOnce();
    });
  });
});
