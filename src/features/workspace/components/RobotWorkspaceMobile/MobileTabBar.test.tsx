import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MobileTabBar } from './MobileTabBar';

describe('MobileTabBar', () => {
  it('renders all tab labels', () => {
    render(<MobileTabBar activePanel="camera" onTabPress={vi.fn()} />);

    expect(screen.getByText('CAM')).toBeInTheDocument();
    expect(screen.getByText('LDR')).toBeInTheDocument();
    expect(screen.getByText('SYS')).toBeInTheDocument();
    expect(screen.getByText('IMU')).toBeInTheDocument();
    expect(screen.getByText('TEL')).toBeInTheDocument();
    expect(screen.getByText('PILOT')).toBeInTheDocument();
  });

  it('calls onTabPress with the tab id when clicked', () => {
    const onTabPress = vi.fn();
    render(<MobileTabBar activePanel="camera" onTabPress={onTabPress} />);

    fireEvent.click(screen.getByLabelText('Show LDR panel'));
    expect(onTabPress).toHaveBeenCalledWith('lidar');
  });

  it('applies active styling to the current panel tab', () => {
    render(<MobileTabBar activePanel="lidar" onTabPress={vi.fn()} />);

    const lidarTab = screen.getByLabelText('Show LDR panel');
    expect(lidarTab).toHaveClass('text-accent');
  });

  it('applies caution styling to pilot tab when not active', () => {
    render(<MobileTabBar activePanel="camera" onTabPress={vi.fn()} />);

    const pilotTab = screen.getByLabelText('Open Pilot Mode');
    expect(pilotTab).toHaveClass('text-status-caution');
  });

  it('sets aria-current on the active tab', () => {
    render(<MobileTabBar activePanel="imu" onTabPress={vi.fn()} />);

    const imuTab = screen.getByLabelText('Show IMU panel');
    expect(imuTab).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on inactive tabs', () => {
    render(<MobileTabBar activePanel="imu" onTabPress={vi.fn()} />);

    const cameraTab = screen.getByLabelText('Show CAM panel');
    expect(cameraTab).not.toHaveAttribute('aria-current');
  });

  it('renders a nav element with workspace panels label', () => {
    render(<MobileTabBar activePanel="camera" onTabPress={vi.fn()} />);

    expect(screen.getByRole('navigation', { name: 'Workspace panels' })).toBeInTheDocument();
  });
});
