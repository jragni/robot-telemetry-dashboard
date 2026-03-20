import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { panelRegistry } from '../../registry/panelRegistry';

import { PanelPicker } from './PanelPicker';

vi.mock('../../registry/panelRegistry', () => ({
  panelRegistry: [
    {
      widgetId: 'video',
      label: 'Video Feed',
      description: 'Live robot video',
      availableInModes: ['dashboard', 'pilot', 'engineer'],
      defaultSize: { w: 4, h: 6 },
      minSize: { w: 2, h: 2 },
    },
    {
      widgetId: 'imu',
      label: 'IMU',
      description: 'Inertial measurement unit data',
      availableInModes: ['pilot', 'engineer'],
      defaultSize: { w: 3, h: 3 },
      minSize: { w: 2, h: 2 },
    },
    {
      widgetId: 'lidar',
      label: 'LiDAR',
      description: 'LiDAR scan data',
      availableInModes: ['engineer'],
      defaultSize: { w: 4, h: 6 },
      minSize: { w: 2, h: 2 },
    },
    {
      widgetId: 'map',
      label: 'Map (SLAM)',
      description: 'SLAM occupancy map',
      availableInModes: ['dashboard', 'engineer'],
      defaultSize: { w: 6, h: 8 },
      minSize: { w: 4, h: 4 },
    },
  ],
}));

const defaultProps = {
  mode: 'engineer' as const,
  onAddPanel: vi.fn(),
  onClose: vi.fn(),
};

describe('PanelPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all widgets available in the current mode', () => {
    render(<PanelPicker {...defaultProps} mode="engineer" />);
    expect(screen.getByText('Video Feed')).toBeInTheDocument();
    expect(screen.getByText('IMU')).toBeInTheDocument();
    expect(screen.getByText('LiDAR')).toBeInTheDocument();
    expect(screen.getByText('Map (SLAM)')).toBeInTheDocument();
  });

  it('only shows widgets available in pilot mode when mode=pilot', () => {
    render(<PanelPicker {...defaultProps} mode="pilot" />);
    expect(screen.getByText('Video Feed')).toBeInTheDocument();
    expect(screen.getByText('IMU')).toBeInTheDocument();
    expect(screen.queryByText('LiDAR')).not.toBeInTheDocument();
    expect(screen.queryByText('Map (SLAM)')).not.toBeInTheDocument();
  });

  it('shows widget descriptions', () => {
    render(<PanelPicker {...defaultProps} />);
    expect(screen.getByText('LiDAR scan data')).toBeInTheDocument();
  });

  it('has a search input', () => {
    render(<PanelPicker {...defaultProps} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('search filters widgets by label', () => {
    render(<PanelPicker {...defaultProps} />);
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'lidar' } });
    expect(screen.getByText('LiDAR')).toBeInTheDocument();
    expect(screen.queryByText('IMU')).not.toBeInTheDocument();
  });

  it('search is case-insensitive', () => {
    render(<PanelPicker {...defaultProps} />);
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'VIDEO' },
    });
    expect(screen.getByText('Video Feed')).toBeInTheDocument();
  });

  it('shows empty state when search matches nothing', () => {
    render(<PanelPicker {...defaultProps} />);
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'xxxxxxxx' },
    });
    expect(screen.getByText(/no panels found/i)).toBeInTheDocument();
  });

  it('clicking a widget calls onAddPanel with widgetId', () => {
    const onAddPanel = vi.fn();
    render(<PanelPicker {...defaultProps} onAddPanel={onAddPanel} />);
    fireEvent.click(screen.getByText('IMU'));
    expect(onAddPanel).toHaveBeenCalledWith('imu');
  });

  it('has a close/dismiss button', () => {
    render(<PanelPicker {...defaultProps} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('clicking close button calls onClose', () => {
    const onClose = vi.fn();
    render(<PanelPicker {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders as a dialog/modal', () => {
    render(<PanelPicker {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
