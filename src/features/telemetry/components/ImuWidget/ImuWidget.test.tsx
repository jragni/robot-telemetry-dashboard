import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ImuWidget } from './ImuWidget';

// Mock the hook so component tests focus on rendering, not data plumbing
vi.mock('../../hooks/useImuData', () => ({
  useImuData: vi.fn(),
}));

vi.mock('../../hooks/useRosConnection', () => ({
  useRosConnection: vi.fn(),
}));

const defaultProps = {
  robotId: 'robot-1',
  panelId: 'panel-1',
  topicName: '/imu/data',
};

const connectedResult = {
  isConnected: true,
  transport: {},
  connectionState: 'connected' as const,
};

const imuDataResult = {
  imuData: {
    orientation: { x: 0, y: 0, z: 0, w: 1 },
    angular_velocity: { x: 0.1, y: -0.05, z: 0.02 },
    linear_acceleration: { x: 0.01, y: -0.02, z: 9.81 },
  },
  euler: { roll: 10.5, pitch: -5.2, yaw: 45.0 },
  history: [{ timestamp: 1000, roll: 10.5, pitch: -5.2, yaw: 45.0 }],
};

describe('ImuWidget', () => {
  beforeEach(async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue(connectedResult);

    const { useImuData } = await import('../../hooks/useImuData');
    vi.mocked(useImuData).mockReturnValue(imuDataResult);
  });

  it('renders without crashing', () => {
    render(<ImuWidget {...defaultProps} />);
  });

  it('renders digital view by default', () => {
    render(<ImuWidget {...defaultProps} />);
    // Digital view shows labeled numeric values
    expect(screen.getByText(/roll/i)).toBeInTheDocument();
    expect(screen.getByText(/pitch/i)).toBeInTheDocument();
    expect(screen.getByText(/yaw/i)).toBeInTheDocument();
  });

  it('renders roll/pitch/yaw values in digital view', () => {
    render(<ImuWidget {...defaultProps} />);
    expect(screen.getByText(/10\.50/)).toBeInTheDocument();
    expect(screen.getByText(/-5\.20/)).toBeInTheDocument();
    expect(screen.getByText(/45\.00/)).toBeInTheDocument();
  });

  it('renders angular velocity fields in digital view', () => {
    render(<ImuWidget {...defaultProps} />);
    expect(screen.getByText(/angular velocity/i)).toBeInTheDocument();
  });

  it('renders linear acceleration fields in digital view', () => {
    render(<ImuWidget {...defaultProps} />);
    expect(screen.getByText(/linear acceleration/i)).toBeInTheDocument();
  });

  it('toggles to plot view when toggle button is clicked', () => {
    render(<ImuWidget {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /plot/i });
    fireEvent.click(toggleButton);
    // Plot view should now be visible (Recharts LineChart or plot container)
    expect(screen.getByTestId('imu-plot-view')).toBeInTheDocument();
  });

  it('toggles back to digital view from plot view', () => {
    render(<ImuWidget {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /plot/i });
    fireEvent.click(toggleButton);
    const digitalButton = screen.getByRole('button', { name: /digital/i });
    fireEvent.click(digitalButton);
    expect(screen.getByText(/roll/i)).toBeInTheDocument();
  });

  it('renders NoConnectionOverlay when disconnected', async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue({
      isConnected: false,
      transport: null,
      connectionState: 'disconnected',
    });

    render(<ImuWidget {...defaultProps} />);
    expect(screen.getByTestId('no-connection-overlay')).toBeInTheDocument();
  });

  it('renders skeleton loaders when connected but no data yet', async () => {
    const { useImuData } = await import('../../hooks/useImuData');
    vi.mocked(useImuData).mockReturnValue({
      imuData: null,
      euler: null,
      history: [],
    });

    render(<ImuWidget {...defaultProps} />);
    // Should show skeleton, not "0.00"
    expect(screen.queryByText(/^0\.00$/)).not.toBeInTheDocument();
    expect(screen.getByTestId('imu-skeleton')).toBeInTheDocument();
  });

  it('renders dash for missing optional fields', async () => {
    const { useImuData } = await import('../../hooks/useImuData');
    vi.mocked(useImuData).mockReturnValue({
      imuData: {
        orientation: { x: 0, y: 0, z: 0, w: 1 },
        angular_velocity: null,
        linear_acceleration: null,
      },
      euler: { roll: 0, pitch: 0, yaw: 0 },
      history: [],
    });

    render(<ImuWidget {...defaultProps} />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
