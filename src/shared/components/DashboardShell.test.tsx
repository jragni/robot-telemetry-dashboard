import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { DashboardShell } from './DashboardShell';

vi.mock('@/shared/hooks/use-mobile', () => ({
  useMobile: () => false,
}));

function renderShell(initialPath = '/dashboard') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <DashboardShell />,
        children: [
          {
            path: 'dashboard',
            element: <div>Dashboard Content</div>,
          },
        ],
      },
    ],
    { initialEntries: [initialPath] }
  );

  return render(<RouterProvider router={router} />);
}

describe('DashboardShell', () => {
  it('renders the header', () => {
    renderShell();
    expect(screen.getByText(/robot telemetry dashboard/i)).toBeInTheDocument();
  });

  it('renders the outlet content', () => {
    renderShell();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('renders the sidebar', () => {
    renderShell();
    expect(screen.getByLabelText('Sidebar')).toBeInTheDocument();
  });

  it('renders the sidebar toggle', () => {
    renderShell();
    expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument();
  });
});
