import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import { WorkspaceNotFound } from './WorkspaceNotFound';

describe('WorkspaceNotFound', () => {
  it('renders the robot ID in the message', () => {
    render(
      <MemoryRouter>
        <WorkspaceNotFound robotId="atlas-99" />
      </MemoryRouter>,
    );
    expect(screen.getByText(/atlas-99/)).toBeInTheDocument();
  });

  it('renders a link back to the fleet page', () => {
    render(
      <MemoryRouter>
        <WorkspaceNotFound robotId="bot-x" />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /back to fleet/i });
    expect(link).toHaveAttribute('href', '/fleet');
  });

  it('renders gracefully when robotId is undefined', () => {
    render(
      <MemoryRouter>
        <WorkspaceNotFound robotId={undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Robot not found')).toBeInTheDocument();
  });
});
