import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { MinimizedPanelBar } from './MinimizedPanelBar';

describe('MinimizedPanelBar', () => {
  it('returns null when no panels are minimized', () => {
    const { container } = render(
      <MinimizedPanelBar isMinimized={() => false} minimizedIds={new Set()} onRestore={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders restore buttons for minimized panels', () => {
    render(
      <MinimizedPanelBar
        isMinimized={(id) => id === 'camera' || id === 'lidar'}
        minimizedIds={new Set(['camera', 'lidar'])}
        onRestore={vi.fn()}
      />,
    );
    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('LiDAR')).toBeInTheDocument();
    expect(screen.queryByText('IMU')).not.toBeInTheDocument();
  });

  it('calls onRestore with the panel ID when a button is clicked', () => {
    const onRestore = vi.fn();

    render(
      <MinimizedPanelBar
        isMinimized={(id) => id === 'imu'}
        minimizedIds={new Set(['imu'])}
        onRestore={onRestore}
      />,
    );

    fireEvent.click(screen.getByText('IMU'));
    expect(onRestore).toHaveBeenCalledWith('imu');
  });

  it('renders a nav element with accessible label', () => {
    render(
      <MinimizedPanelBar
        isMinimized={(id) => id === 'status'}
        minimizedIds={new Set(['status'])}
        onRestore={vi.fn()}
      />,
    );
    expect(screen.getByRole('navigation', { name: /minimized panels/i })).toBeInTheDocument();
  });
});
