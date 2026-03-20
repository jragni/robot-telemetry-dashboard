import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { DashboardShell } from '@/shared/components/DashboardShell';

vi.mock('@/shared/hooks/use-mobile', () => ({
  useMobile: () => false,
}));

describe('App', () => {
  it('renders without crashing', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <DashboardShell />,
          children: [
            {
              path: 'dashboard',
              element: <div>Dashboard</div>,
            },
          ],
        },
      ],
      { initialEntries: ['/dashboard'] }
    );

    render(<RouterProvider router={router} />);
    expect(screen.getByText(/robot telemetry dashboard/i)).toBeInTheDocument();
  });
});
