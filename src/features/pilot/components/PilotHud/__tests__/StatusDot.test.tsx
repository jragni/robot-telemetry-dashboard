import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusDot } from '../StatusDot';

describe('StatusDot', () => {
  it('renders label text', () => {
    render(<StatusDot connected={true} label="ROS" />);
    expect(screen.getByText('ROS')).toBeInTheDocument();
  });

  it('applies nominal styles when connected', () => {
    render(<StatusDot connected={true} label="ROS" />);
    const label = screen.getByText('ROS');
    expect(label).toHaveClass('text-status-nominal');
  });

  it('applies critical styles when disconnected', () => {
    render(<StatusDot connected={false} label="VID" />);
    const label = screen.getByText('VID');
    expect(label).toHaveClass('text-status-critical');
  });

  it('renders the dot indicator with aria-hidden', () => {
    const { container } = render(<StatusDot connected={true} label="ROS" />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('bg-status-nominal');
  });

  it('renders critical dot when disconnected', () => {
    const { container } = render(<StatusDot connected={false} label="ROS" />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toHaveClass('bg-status-critical');
  });
});
