import { render, screen } from '@testing-library/react';

import { MinimalHeader } from './MinimalHeader';

describe('MinimalHeader', () => {
  it('renders the app title', () => {
    render(<MinimalHeader />);
    expect(screen.getByText(/robot telemetry dashboard/i)).toBeInTheDocument();
  });

  it('does NOT render nav links (Dashboard | Fleet | Map)', () => {
    render(<MinimalHeader />);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Fleet')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Main navigation' })
    ).not.toBeInTheDocument();
  });

  it('renders active robot name when provided', () => {
    render(<MinimalHeader activeRobotId="bot-1" />);
    expect(screen.getByText('bot-1')).toBeInTheDocument();
  });

  it('renders nothing for robot status when no robot is active', () => {
    render(<MinimalHeader />);
    expect(screen.queryByTestId('active-robot-status')).not.toBeInTheDocument();
  });
});
