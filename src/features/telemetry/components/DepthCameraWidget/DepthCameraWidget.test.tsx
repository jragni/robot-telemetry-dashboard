import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DepthCameraWidget } from './DepthCameraWidget';

vi.mock('../../hooks/useDepthCamera', () => ({
  useDepthCamera: vi.fn(),
}));

vi.mock('../../hooks/useRosConnection', () => ({
  useRosConnection: vi.fn(),
}));

const mockContext: Partial<CanvasRenderingContext2D> = {
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  getImageData: vi
    .fn()
    .mockReturnValue({ data: new Uint8ClampedArray(4), width: 1, height: 1 }),
  putImageData: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  fillStyle: '',
  font: '',
  textAlign: 'left',
  textBaseline: 'alphabetic',
};

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);
});

const defaultProps = {
  robotId: 'robot-1',
  panelId: 'panel-1',
  topicName: '/camera/depth/compressed',
};

const connectedResult = {
  isConnected: true,
  transport: {},
  connectionState: 'connected' as const,
};

describe('DepthCameraWidget', () => {
  beforeEach(async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue(connectedResult);

    const { useDepthCamera } = await import('../../hooks/useDepthCamera');
    vi.mocked(useDepthCamera).mockReturnValue({
      hasFrame: false,
      error: null,
      fps: null,
    });
  });

  it('renders without crashing', () => {
    render(<DepthCameraWidget {...defaultProps} />);
  });

  it('renders a canvas element', () => {
    render(<DepthCameraWidget {...defaultProps} />);
    expect(screen.getByTestId('depth-camera-canvas')).toBeInTheDocument();
  });

  it('renders "Awaiting feed…" placeholder when no frames received', () => {
    render(<DepthCameraWidget {...defaultProps} />);
    expect(screen.getByText(/awaiting feed/i)).toBeInTheDocument();
  });

  it('does not render "Awaiting feed…" when frame is available', async () => {
    const { useDepthCamera } = await import('../../hooks/useDepthCamera');
    vi.mocked(useDepthCamera).mockReturnValue({
      hasFrame: true,
      error: null,
      fps: 10,
    });

    render(<DepthCameraWidget {...defaultProps} />);
    expect(screen.queryByText(/awaiting feed/i)).not.toBeInTheDocument();
  });

  it('renders NoConnectionOverlay when disconnected', async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue({
      isConnected: false,
      transport: null,
      connectionState: 'disconnected',
    });

    render(<DepthCameraWidget {...defaultProps} />);
    expect(screen.getByTestId('no-connection-overlay')).toBeInTheDocument();
  });

  it('renders error state for corrupt image data', async () => {
    const { useDepthCamera } = await import('../../hooks/useDepthCamera');
    vi.mocked(useDepthCamera).mockReturnValue({
      hasFrame: false,
      error: 'Corrupt image data received',
      fps: null,
    });

    render(<DepthCameraWidget {...defaultProps} />);
    expect(screen.getByText(/corrupt image data/i)).toBeInTheDocument();
  });

  it('renders error state for unsupported format', async () => {
    const { useDepthCamera } = await import('../../hooks/useDepthCamera');
    vi.mocked(useDepthCamera).mockReturnValue({
      hasFrame: false,
      error: 'Unsupported format: rgb8',
      fps: null,
    });

    render(<DepthCameraWidget {...defaultProps} />);
    expect(screen.getByText(/unsupported format/i)).toBeInTheDocument();
  });

  it('renders FPS counter when showFps=true and frame available', async () => {
    const { useDepthCamera } = await import('../../hooks/useDepthCamera');
    vi.mocked(useDepthCamera).mockReturnValue({
      hasFrame: true,
      error: null,
      fps: 9.5,
    });

    render(<DepthCameraWidget {...defaultProps} showFps={true} />);
    expect(screen.getByTestId('fps-counter')).toBeInTheDocument();
  });

  it('does not render FPS counter when showFps=false (default)', async () => {
    const { useDepthCamera } = await import('../../hooks/useDepthCamera');
    vi.mocked(useDepthCamera).mockReturnValue({
      hasFrame: true,
      error: null,
      fps: 9.5,
    });

    render(<DepthCameraWidget {...defaultProps} showFps={false} />);
    expect(screen.queryByTestId('fps-counter')).not.toBeInTheDocument();
  });
});
