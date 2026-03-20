import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { BottomTabBar } from './BottomTabBar';

function renderBottomTabBar(isMobile: boolean, initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomTabBar isMobile={isMobile} />
    </MemoryRouter>
  );
}

describe('BottomTabBar', () => {
  it('renders 4 tabs on mobile', () => {
    renderBottomTabBar(true);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Fleet')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Pilot')).toBeInTheDocument();
  });

  it('hides on desktop', () => {
    renderBottomTabBar(false);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Fleet')).not.toBeInTheDocument();
  });

  it('hides during pilot mode', () => {
    renderBottomTabBar(true, '/pilot/robot-1');
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('renders mobile navigation aria label', () => {
    renderBottomTabBar(true);
    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument();
  });
});
