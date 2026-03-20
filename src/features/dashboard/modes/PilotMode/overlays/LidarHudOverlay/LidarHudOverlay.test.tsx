import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { LidarHudOverlay } from './LidarHudOverlay';

const defaultProps = {
  robotId: 'robot-1',
  isVisible: true,
  onToggleVisibility: vi.fn(),
};

describe('LidarHudOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders when isVisible is true', () => {
    render(<LidarHudOverlay {...defaultProps} />);
    expect(screen.getByTestId('lidar-hud-overlay')).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    render(<LidarHudOverlay {...defaultProps} isVisible={false} />);
    expect(screen.queryByTestId('lidar-hud-overlay')).not.toBeInTheDocument();
  });

  it('is positioned in bottom-left corner of video panel', () => {
    render(<LidarHudOverlay {...defaultProps} />);
    const overlay = screen.getByTestId('lidar-hud-overlay');
    // Position enforced via CSS class; verify data attribute for testing
    expect(overlay).toHaveAttribute('data-position', 'bottom-left');
  });

  it('tap/click toggles to expanded (fullscreen) LiDAR view', () => {
    render(<LidarHudOverlay {...defaultProps} />);
    fireEvent.click(screen.getByTestId('lidar-hud-overlay'));
    expect(screen.getByTestId('lidar-hud-expanded')).toBeInTheDocument();
  });

  it('second click collapses back from expanded view', () => {
    render(<LidarHudOverlay {...defaultProps} />);
    fireEvent.click(screen.getByTestId('lidar-hud-overlay'));
    fireEvent.click(screen.getByTestId('lidar-hud-expanded'));
    expect(screen.queryByTestId('lidar-hud-expanded')).not.toBeInTheDocument();
  });

  it('persists isVisible to localStorage', () => {
    render(<LidarHudOverlay {...defaultProps} isVisible={true} />);
    expect(localStorage.getItem('rdt-lidar-hud-visible')).toBe('true');
  });

  it('persists isVisible=false to localStorage', () => {
    render(<LidarHudOverlay {...defaultProps} isVisible={false} />);
    expect(localStorage.getItem('rdt-lidar-hud-visible')).toBe('false');
  });
});
