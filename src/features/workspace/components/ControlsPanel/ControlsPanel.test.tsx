import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Ros } from 'roslib';

import { ControlsPanel } from './ControlsPanel';

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

vi.mock('roslib', () => ({
  Topic: class MockTopic {
    publish = vi.fn();
  },
}));

vi.mock('@/hooks/useControlPublisher/useControlPublisher', () => ({
  useControlPublisher: () => ({
    angularVelocity: 0.39,
    handleAngularChange: vi.fn(),
    handleDirectionEnd: vi.fn(),
    handleDirectionStart: vi.fn(),
    handleEmergencyStop: vi.fn(),
    handleLinearChange: vi.fn(),
    isActive: false,
    linearVelocity: 0.15,
  }),
}));

function createMockRos(): Ros {
  return {} as unknown as Ros;
}

function renderPanel(overrides: Partial<Parameters<typeof ControlsPanel>[0]> = {}) {
  const defaultProps = {
    connected: true,
    robotId: 'robot-1',
    ros: createMockRos(),
    topicName: '/cmd_vel',
    ...overrides,
  };

  return render(
    <MemoryRouter>
      <ControlsPanel {...defaultProps} />
    </MemoryRouter>,
  );
}

describe('ControlsPanel', () => {
  it('renders E-STOP button', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /emergency stop/i })).toBeInTheDocument();
  });

  it('renders velocity sliders with correct labels', () => {
    renderPanel();
    expect(screen.getByText('LINEAR')).toBeInTheDocument();
    expect(screen.getByText('ANGULAR')).toBeInTheDocument();
  });

  it('shows STOPPED status when connected but not active', () => {
    renderPanel({ connected: true });
    expect(screen.getByText('STOPPED')).toBeInTheDocument();
  });

  it('shows DISCONNECTED status when not connected', () => {
    renderPanel({ connected: false });
    expect(screen.getByText('DISCONNECTED')).toBeInTheDocument();
  });

  it('disables E-STOP button when disconnected', () => {
    renderPanel({ connected: false });
    expect(screen.getByRole('button', { name: /emergency stop/i })).toBeDisabled();
  });

  it('renders Pilot Mode button when robotId is provided', () => {
    renderPanel({ robotId: 'robot-1' });
    expect(screen.getByRole('button', { name: /enter pilot mode/i })).toBeInTheDocument();
  });

  it('does not render Pilot Mode button when robotId is undefined', () => {
    renderPanel({ robotId: undefined });
    expect(screen.queryByRole('button', { name: /enter pilot mode/i })).not.toBeInTheDocument();
  });

  it('renders with ros undefined without crashing', () => {
    renderPanel({ ros: undefined });
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });
});
