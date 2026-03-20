import { render, screen } from '@testing-library/react';

import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('accepts custom label', () => {
    render(<LoadingSpinner label="Connecting to ROS" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Connecting to ROS'
    );
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="mt-4" />);
    expect(screen.getByRole('status')).toHaveClass('mt-4');
  });

  it('renders all size variants without error', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<LoadingSpinner size="md" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
