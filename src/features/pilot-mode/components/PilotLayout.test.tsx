import { render, screen } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PilotLayout } from './PilotLayout';

// ---------------------------------------------------------------------------
// Hoisted mock fns — must exist before vi.mock factories run
// ---------------------------------------------------------------------------

const {
  mockWebRTCConnect,
  mockWebRTCDisconnect,
  mockWebRTCGetTransport,
  mockNavigate,
} = vi.hoisted(() => ({
  mockWebRTCConnect: vi.fn(),
  mockWebRTCDisconnect: vi.fn(),
  mockWebRTCGetTransport: vi.fn(),
  mockNavigate: vi.fn(),
}));

// Stable media stream observable at module scope (safe after hoisting).
const mockMediaStream$ = new BehaviorSubject<MediaStream | null>(null);

mockWebRTCGetTransport.mockReturnValue({
  getMediaStream$: vi.fn(() => mockMediaStream$),
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@/services/webrtc/registry/WebRTCServiceRegistry', () => ({
  webRTCServiceRegistry: {
    connect: mockWebRTCConnect,
    disconnect: mockWebRTCDisconnect,
    getTransport: mockWebRTCGetTransport,
  },
}));

vi.mock('@/services/ros/registry/RosServiceRegistry', () => ({
  rosServiceRegistry: {
    getTransport: vi.fn(() => ({
      getRosInstance: vi.fn(() => null),
    })),
  },
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

vi.mock('@/stores/webrtc/webrtc.store', () => ({
  useWebRTCStore: vi.fn(
    (
      selector: (s: { getConnectionState: (id: string) => string }) => unknown
    ) => selector({ getConnectionState: () => 'disconnected' })
  ),
}));

vi.mock('@/stores/ros/ros.store', () => ({
  useRosStore: vi.fn(
    (
      selector: (s: { getConnectionState: (id: string) => string }) => unknown
    ) => selector({ getConnectionState: () => 'disconnected' })
  ),
}));

vi.mock('@/stores/connections/connections.store', () => ({
  useConnectionsStore: vi.fn(
    (
      selector: (s: {
        robots: { id: string; baseUrl: string }[];
        activeRobotId: string | null;
      }) => unknown
    ) =>
      selector({
        robots: [{ id: 'robot-1', baseUrl: 'http://robot.local:8080' }],
        activeRobotId: 'robot-1',
      })
  ),
}));

vi.mock('@/stores/control/control.store', () => ({
  useControlStore: Object.assign(
    vi.fn(
      (
        selector: (s: {
          getControlState: (id: string) => {
            linearVelocity: number;
            angularVelocity: number;
            selectedTopic: string;
            isEStopActive: boolean;
          };
        }) => unknown
      ) =>
        selector({
          getControlState: () => ({
            linearVelocity: 0.5,
            angularVelocity: 0.5,
            selectedTopic: '/cmd_vel',
            isEStopActive: false,
          }),
        })
    ),
    {
      getState: vi.fn(() => ({
        robotControls: {},
        activateEStop: vi.fn(),
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

// LiDAR hooks — return no data (no ROS connection in tests)
vi.mock('@/hooks/useLidarData', () => ({
  useLidarData: vi.fn(() => ({
    data: null,
    connectionState: 'disconnected',
    topicName: '/scan',
  })),
}));

vi.mock('@/hooks/useLidarCanvas', () => ({
  useLidarCanvas: vi.fn(() => ({
    canvasRef: { current: null },
    scale: 30,
    setScale: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
  })),
}));

// Control publisher hook
vi.mock('@/features/control/hooks/useControlPublisher', () => ({
  useControlPublisher: vi.fn(() => ({
    publish: vi.fn(),
    isReady: false,
  })),
}));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROBOT_ID = 'robot-1';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PilotLayout', () => {
  beforeEach(() => {
    mockWebRTCConnect.mockReset();
    mockWebRTCDisconnect.mockReset();
    mockWebRTCGetTransport.mockReturnValue({
      getMediaStream$: vi.fn(() => mockMediaStream$),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Layout structure
  // -------------------------------------------------------------------------

  it('renders the pilot layout container', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    expect(screen.getByTestId('pilot-layout')).toBeInTheDocument();
  });

  it('renders the video feed for the robot', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    // VideoFeed renders a <video> element
    const video = document.querySelector('video');
    expect(video).not.toBeNull();
  });

  it('renders the control pad overlay', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    expect(screen.getByTestId('pilot-control-pad')).toBeInTheDocument();
  });

  it('renders directional control buttons inside the control pad', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    expect(
      screen.getByRole('button', { name: /forward/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /backward/i })
    ).toBeInTheDocument();
  });

  it('renders the LiDAR minimap', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    expect(screen.getByTestId('pilot-lidar-minimap')).toBeInTheDocument();
  });

  it('renders the connection status badges', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    expect(screen.getByTestId('hud-connection-badges')).toBeInTheDocument();
  });

  it('renders the ROS status label in the connection badges', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    expect(screen.getByText('ROS')).toBeInTheDocument();
  });

  it('renders the VIDEO status label in the connection badges', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    expect(screen.getByText('VIDEO')).toBeInTheDocument();
  });

  it('renders the exit button', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    expect(
      screen.getByRole('button', { name: /exit pilot mode/i })
    ).toBeInTheDocument();
  });

  it('renders the velocity readout', () => {
    render(<PilotLayout robotId={ROBOT_ID} />);

    expect(screen.getByTestId('hud-velocity-readout')).toBeInTheDocument();
  });
});
