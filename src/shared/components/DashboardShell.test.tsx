// DashboardShell is superseded by AppShell in Phase 8 IA redesign.
// These tests are kept as a tombstone until DashboardShell.tsx is deleted.
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { DashboardShell } from './DashboardShell';

vi.mock('@/shared/hooks/use-mobile', () => ({
  useMobile: () => false,
}));

// DashboardShell now uses AppShell internally — mock resizable panels
vi.mock('@/components/ui/resizable', () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ResizablePanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ResizableHandle: () => <div />,
}));

vi.mock('@/shared/stores/ros/ros.store', () => ({
  useRosStore: vi.fn(
    (selector: (s: { connectionStates: Record<string, unknown> }) => unknown) =>
      selector({ connectionStates: {} })
  ),
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
});
