import { render, screen } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { VideoFeed } from './VideoFeed';

// ---------------------------------------------------------------------------
// Hoisted mock fns — vi.hoisted ensures these exist before the vi.mock factory
// runs (vi.mock factories are statically hoisted to the top of the module).
// Only vi.fn() calls are safe here; imported symbols like BehaviorSubject are
// NOT available inside vi.hoisted.
// ---------------------------------------------------------------------------

const { mockConnect, mockDisconnect, mockGetTransport } = vi.hoisted(() => ({
  mockConnect: vi.fn(),
  mockDisconnect: vi.fn(),
  mockGetTransport: vi.fn(),
}));

// BehaviorSubject is a regular import — safe to use at module scope.
const mockMediaStream$ = new BehaviorSubject<MediaStream | null>(null);

// Wire up the getTransport return value (after BehaviorSubject is available).
mockGetTransport.mockReturnValue({
  getMediaStream$: vi.fn(() => mockMediaStream$),
});

vi.mock('@/services/webrtc/WebRTCServiceRegistry', () => ({
  webRTCServiceRegistry: {
    connect: mockConnect,
    disconnect: mockDisconnect,
    getTransport: mockGetTransport,
  },
}));

// ---------------------------------------------------------------------------
// Mutable connection state — controlled per-test.
// The store mock reads from this variable on every selector invocation so
// updating it before render changes what the component sees.
// ---------------------------------------------------------------------------

let mockConnectionState = 'disconnected';

vi.mock('@/stores/webrtc/webrtc.store', () => ({
  useWebRTCStore: vi.fn(
    (
      selector: (s: { getConnectionState: (id: string) => string }) => unknown
    ) =>
      selector({
        getConnectionState: (_robotId: string) => mockConnectionState,
      })
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROBOT_ID = 'robot-1';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VideoFeed', () => {
  beforeEach(() => {
    mockConnectionState = 'disconnected';
    mockConnect.mockReset();
    mockDisconnect.mockReset();
    mockGetTransport.mockReturnValue({
      getMediaStream$: vi.fn(() => mockMediaStream$),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------

  it('renders a video element', () => {
    render(<VideoFeed robotId={ROBOT_ID} />);

    const video = document.querySelector('video');
    expect(video).not.toBeNull();
  });

  it('calls registry.connect on mount with robotId', () => {
    render(<VideoFeed robotId={ROBOT_ID} />);

    expect(mockConnect).toHaveBeenCalledWith(ROBOT_ID, expect.any(String));
  });

  it('calls registry.disconnect on unmount', () => {
    const { unmount } = render(<VideoFeed robotId={ROBOT_ID} />);

    unmount();

    expect(mockDisconnect).toHaveBeenCalledWith(ROBOT_ID);
  });

  it('shows status overlay by default', () => {
    render(<VideoFeed robotId={ROBOT_ID} />);

    const overlay = document.querySelector(
      '[data-testid="video-status-overlay"]'
    );
    expect(overlay).not.toBeNull();
  });

  it('hides status overlay when showStatusOverlay=false', () => {
    render(<VideoFeed robotId={ROBOT_ID} showStatusOverlay={false} />);

    const overlay = document.querySelector(
      '[data-testid="video-status-overlay"]'
    );
    expect(overlay).toBeNull();
  });

  it('displays CONNECTING text when state is connecting', () => {
    mockConnectionState = 'connecting';
    render(<VideoFeed robotId={ROBOT_ID} />);

    expect(screen.getByText(/connecting/i)).toBeDefined();
  });

  it('displays ERROR text when state is error', () => {
    mockConnectionState = 'error';
    render(<VideoFeed robotId={ROBOT_ID} />);

    expect(screen.getByText(/error/i)).toBeDefined();
  });

  it('displays DISCONNECTED text when state is disconnected', () => {
    mockConnectionState = 'disconnected';
    render(<VideoFeed robotId={ROBOT_ID} />);

    expect(screen.getByText(/disconnected/i)).toBeDefined();
  });

  it('renders video with muted attribute by default', () => {
    render(<VideoFeed robotId={ROBOT_ID} />);

    const video = document.querySelector('video');
    expect(video).not.toBeNull();
    expect(video?.muted).toBe(true);
  });

  it('applies custom className to the container', () => {
    render(<VideoFeed robotId={ROBOT_ID} className="custom-class" />);

    const container = document.querySelector('.custom-class');
    expect(container).not.toBeNull();
  });
});
