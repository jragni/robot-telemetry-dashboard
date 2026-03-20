import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { Header } from './Header';

function renderHeader(isMobile = false, initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header isMobile={isMobile} />
    </MemoryRouter>
  );
}

describe('Header', () => {
  it('renders the title', () => {
    renderHeader();
    expect(screen.getByText(/robot telemetry dashboard/i)).toBeInTheDocument();
  });

  it('renders nav links on desktop', () => {
    renderHeader(false);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Fleet')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
  });

  it('hides nav links on mobile', () => {
    renderHeader(true);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Fleet')).not.toBeInTheDocument();
    expect(screen.queryByText('Map')).not.toBeInTheDocument();
  });

  it('renders nav with aria label', () => {
    renderHeader(false);
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
  });
});
