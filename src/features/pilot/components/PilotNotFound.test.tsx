import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import { PilotNotFound } from './PilotNotFound';

describe('PilotNotFound', () => {
  it('renders robot ID in message', () => {
    render(
      <MemoryRouter>
        <PilotNotFound robotId="test-robot-123" />
      </MemoryRouter>,
    );
    expect(screen.getByText(/test-robot-123/)).toBeInTheDocument();
  });

  it('renders back to fleet link', () => {
    render(
      <MemoryRouter>
        <PilotNotFound robotId="abc" />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /back to fleet/i });
    expect(link).toHaveAttribute('href', '/fleet');
  });

  it('renders undefined robotId gracefully', () => {
    render(
      <MemoryRouter>
        <PilotNotFound robotId={undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Robot not found')).toBeInTheDocument();
  });
});
