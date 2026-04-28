import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CameraPanel } from './CameraPanel';

const mockVideoRef = { current: null };

vi.mock('@/hooks/useWebRtcStream', () => ({
  useWebRtcStream: vi.fn(() => ({
    error: null,
    retry: vi.fn(),
    status: 'idle' as const,
    stream: null,
    videoRef: mockVideoRef,
  })),
}));

vi.mock('@/components/CameraEmptyState', () => ({
  CameraEmptyState: ({ label, message }: { label?: string; message: string }) => (
    <div data-testid="camera-empty-state">
      <span>{message}</span>
      {label && <span>{label}</span>}
    </div>
  ),
}));

describe('CameraPanel', () => {
  it('renders a video element with the hook ref', () => {
    const { container } = render(<CameraPanel connected={true} robotUrl="http://localhost:9090" />);

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('autoplay');
  });

  it('shows empty state when not connected', () => {
    render(<CameraPanel connected={false} robotUrl="http://localhost:9090" />);

    const emptyState = screen.getByTestId('camera-empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('does not show empty state when connected', () => {
    render(<CameraPanel connected={true} robotUrl="http://localhost:9090" />);

    expect(screen.queryByTestId('camera-empty-state')).not.toBeInTheDocument();
  });

  it('passes label to empty state', () => {
    render(
      <CameraPanel connected={false} label="/camera/image" robotUrl="http://localhost:9090" />,
    );

    expect(screen.getByText('/camera/image')).toBeInTheDocument();
  });

  it('sets correct aria-label when connected', () => {
    render(<CameraPanel connected={true} robotUrl="http://localhost:9090" />);

    expect(screen.getByLabelText('Camera feed')).toBeInTheDocument();
  });

  it('sets correct aria-label when disconnected', () => {
    render(<CameraPanel connected={false} robotUrl="http://localhost:9090" />);

    expect(screen.getByLabelText('Camera feed — no stream')).toBeInTheDocument();
  });

  it('calls useWebRtcStream with correct options', async () => {
    const { useWebRtcStream } = await import('@/hooks/useWebRtcStream');

    render(<CameraPanel connected={true} robotUrl="http://my-robot:9090" />);

    expect(useWebRtcStream).toHaveBeenCalledWith({
      connected: true,
      enabled: true,
      url: 'http://my-robot:9090',
    });
  });
});
