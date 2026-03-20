import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ControlWidget } from './ControlWidget';

vi.mock('../../hooks/useControlPublisher', () => ({
  useControlPublisher: vi.fn(),
}));

vi.mock('roslib', () => ({
  default: {
    Ros: class MockRos {
      isConnected = false;
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      connect() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      close() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      on() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      off() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      removeAllListeners() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      getTopics() {}
    },
    Topic: class MockTopic {
      name = '';
      messageType = '';
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      advertise() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      unadvertise() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      publish() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      subscribe() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      unsubscribe() {}
    },
  },
}));

vi.mock('@/services/ros/registry/RosServiceRegistry', () => {
  const mockTransport = {
    robotId: 'robot-1',
    url: '',
    connectionState$: { getValue: () => 'connected' },
    connect: vi.fn(),
    disconnect: vi.fn(),
    destroy: vi.fn(),
    getRos: () => ({
      isConnected: true,
      connect: vi.fn(),
      close: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
      getTopics: vi.fn(),
    }),
  };
  return {
    rosServiceRegistry: {
      get: vi.fn(() => mockTransport),
      destroy: vi.fn(),
      destroyAll: vi.fn(),
    },
  };
});

const mockRosState = {
  connectionStates: {
    'robot-1': { state: 'connected', error: null },
  },
  setConnectionState: vi.fn(),
  setConnectionError: vi.fn(),
  getConnectionState: vi.fn(),
  removeRobot: vi.fn(),
  subscribe: vi.fn(() => () => undefined),
};

vi.mock('@/shared/stores/ros/ros.store', () => ({
  useRosStore: vi.fn((selector) => selector(mockRosState)),
}));

vi.mock('@/shared/stores/connections/connections.store', () => ({
  useConnectionsStore: vi.fn(() => ({
    robots: [{ id: 'robot-1', name: 'Robot 1', url: 'ws://localhost:9090' }],
    activeRobotId: 'robot-1',
    addRobot: vi.fn(),
    removeRobot: vi.fn(),
    setActiveRobot: vi.fn(),
  })),
}));

describe('ControlWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ControlWidget robotId="robot-1" panelId="robot-controls" />);
  });

  it('renders EStop component', () => {
    render(<ControlWidget robotId="robot-1" panelId="robot-controls" />);
    expect(screen.getByRole('button', { name: /e-stop/i })).toBeInTheDocument();
  });

  it('renders ControlPad with direction buttons', () => {
    render(<ControlWidget robotId="robot-1" panelId="robot-controls" />);
    expect(
      screen.getByRole('button', { name: /forward/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /backward/i })
    ).toBeInTheDocument();
  });

  it('renders VelocitySliders', () => {
    render(<ControlWidget robotId="robot-1" panelId="robot-controls" />);
    expect(screen.getByRole('slider', { name: /linear/i })).toBeInTheDocument();
    expect(
      screen.getByRole('slider', { name: /angular/i })
    ).toBeInTheDocument();
  });

  it('renders TopicSelector', () => {
    render(<ControlWidget robotId="robot-1" panelId="robot-controls" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('E-Stop button is on the LEFT side of the layout', () => {
    render(<ControlWidget robotId="robot-1" panelId="robot-controls" />);
    const eStopBtn = screen.getByRole('button', { name: /e-stop/i });
    const forwardBtn = screen.getByRole('button', { name: /forward/i });

    // E-Stop should come before ControlPad in DOM (left side)
    const allButtons = screen.getAllByRole('button');
    const eStopIndex = allButtons.indexOf(eStopBtn);
    const forwardIndex = allButtons.indexOf(forwardBtn);
    expect(eStopIndex).toBeLessThan(forwardIndex);
  });

  it('shows "Connect a robot" overlay when robotId is empty', () => {
    render(<ControlWidget robotId="" panelId="robot-controls" />);
    expect(screen.getByText(/connect a robot/i)).toBeInTheDocument();
  });

  it('disables all controls when robotId is empty', () => {
    render(<ControlWidget robotId="" panelId="robot-controls" />);
    // All direction buttons should be disabled
    screen.getAllByRole('button').forEach((btn) => {
      if (!/e-stop/i.test(btn.getAttribute('aria-label') ?? '')) {
        // Non-e-stop controls are disabled
        expect(btn).toBeDisabled();
      }
    });
  });
});
