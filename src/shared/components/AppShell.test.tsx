import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppShell } from './AppShell';

vi.mock('@/shared/stores/ui/ui.store', () => ({
  useUIStore: vi.fn((selector: (s: { immersiveMode: boolean }) => unknown) =>
    selector({ immersiveMode: false })
  ),
}));

vi.mock('@/shared/stores/ros/ros.store', () => ({
  useRosStore: vi.fn(
    (selector: (s: { connectionStates: Record<string, unknown> }) => unknown) =>
      selector({ connectionStates: {} })
  ),
}));

// react-resizable-panels uses ResizeObserver in a way that crashes jsdom
vi.mock('@/components/ui/resizable', () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resizable-group">{children}</div>
  ),
  ResizablePanel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resizable-panel">{children}</div>
  ),
  ResizableHandle: () => <div data-testid="sidebar-resize-handle" />,
}));

function renderAppShell(initialPath = '/') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <div>Fleet Overview</div> },
          { path: 'robot/:robotId', element: <div>Robot Workspace</div> },
          { path: 'map', element: <div>Map View</div> },
        ],
      },
    ],
    { initialEntries: [initialPath] }
  );
  return render(<RouterProvider router={router} />);
}

describe('AppShell', () => {
  it('renders the sidebar', () => {
    renderAppShell();
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('renders the main content outlet', () => {
    renderAppShell();
    expect(screen.getByText('Fleet Overview')).toBeInTheDocument();
  });

  it('renders a minimal header with app title', () => {
    renderAppShell();
    expect(screen.getByText(/robot telemetry dashboard/i)).toBeInTheDocument();
  });

  it('does NOT render old header nav links (Dashboard | Fleet | Map)', () => {
    renderAppShell();
    expect(
      screen.queryByRole('navigation', { name: 'Main navigation' })
    ).not.toBeInTheDocument();
  });

  it('does NOT render BottomTabBar', () => {
    renderAppShell();
    expect(
      screen.queryByRole('navigation', { name: /bottom/i })
    ).not.toBeInTheDocument();
  });

  it('renders outlet content for /robot/:robotId', () => {
    renderAppShell('/robot/bot-1');
    expect(screen.getByText('Robot Workspace')).toBeInTheDocument();
  });

  it('renders outlet content for /map', () => {
    renderAppShell('/map');
    expect(screen.getByText('Map View')).toBeInTheDocument();
  });
});
