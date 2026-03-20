import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { LidarWidget } from './LidarWidget';

vi.mock('../../hooks/useLidarScan', () => ({
  useLidarScan: vi.fn(),
}));

vi.mock('../../hooks/useRosConnection', () => ({
  useRosConnection: vi.fn(),
}));

// Mock Canvas 2D context
const mockContext: Partial<CanvasRenderingContext2D> = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  fillText: vi.fn(),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
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
  topicName: '/scan',
};

const connectedResult = {
  isConnected: true,
  transport: {},
  connectionState: 'connected' as const,
};

// 3-point scan: Float32Array [x0, y0, x1, y1, x2, y2]
const mockScanPoints = new Float32Array([1.0, 0.0, 0.0, 1.0, -1.0, 0.0]);

describe('LidarWidget', () => {
  beforeEach(async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue(connectedResult);

    const { useLidarScan } = await import('../../hooks/useLidarScan');
    vi.mocked(useLidarScan).mockReturnValue({
      scanPoints: mockScanPoints,
      hasData: true,
    });
  });

  it('renders without crashing', () => {
    render(<LidarWidget {...defaultProps} />);
  });

  it('renders a canvas element', () => {
    render(<LidarWidget {...defaultProps} />);
    expect(screen.getByTestId('lidar-canvas')).toBeInTheDocument();
  });

  it('canvas element is accessible in the document', () => {
    render(<LidarWidget {...defaultProps} />);
    const canvas = screen.getByTestId('lidar-canvas');
    expect(canvas.tagName.toLowerCase()).toBe('canvas');
  });

  it('renders zoom in button', () => {
    render(<LidarWidget {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /zoom in/i })
    ).toBeInTheDocument();
  });

  it('renders zoom out button', () => {
    render(<LidarWidget {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /zoom out/i })
    ).toBeInTheDocument();
  });

  it('renders zoom reset button', () => {
    render(<LidarWidget {...defaultProps} />);
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('renders NoConnectionOverlay when disconnected', async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue({
      isConnected: false,
      transport: null,
      connectionState: 'disconnected',
    });

    render(<LidarWidget {...defaultProps} />);
    expect(screen.getByTestId('no-connection-overlay')).toBeInTheDocument();
  });

  it('renders "No scan data" when scan is empty', async () => {
    const { useLidarScan } = await import('../../hooks/useLidarScan');
    vi.mocked(useLidarScan).mockReturnValue({
      scanPoints: new Float32Array(0),
      hasData: false,
    });

    render(<LidarWidget {...defaultProps} />);
    expect(screen.getByText(/no scan data/i)).toBeInTheDocument();
  });

  it('calls getContext on the canvas element', () => {
    render(<LidarWidget {...defaultProps} />);
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
  });
});
