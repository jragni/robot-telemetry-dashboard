import { render, screen } from '@testing-library/react';

import { StatusIndicator } from './StatusIndicator';
import type { ConnectionState } from './StatusIndicator.types';

describe('StatusIndicator', () => {
  const states: ConnectionState[] = [
    'connected',
    'connecting',
    'disconnected',
    'error',
  ];

  it.each(states)('renders with state "%s"', (state) => {
    render(<StatusIndicator state={state} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays default label for connected state', () => {
    render(<StatusIndicator state="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('displays default label for error state', () => {
    render(<StatusIndicator state="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('displays custom label when provided', () => {
    render(<StatusIndicator state="connected" label="ROS Bridge" />);
    expect(screen.getByText('ROS Bridge')).toBeInTheDocument();
    expect(screen.queryByText('Connected')).not.toBeInTheDocument();
  });

  it('sets aria-label from display label', () => {
    render(<StatusIndicator state="disconnected" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Disconnected'
    );
  });

  it('applies custom className', () => {
    render(<StatusIndicator state="connected" className="custom-class" />);
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });
});
