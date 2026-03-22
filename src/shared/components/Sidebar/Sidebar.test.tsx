import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { Sidebar } from './Sidebar';

import { useRosStore } from '@/shared/stores/ros/ros.store';

vi.mock('@/shared/stores/ros/ros.store', () => ({
  useRosStore: vi.fn(),
}));

interface RosState {
  connectionStates: Record<string, { state: string; error: string | null }>;
}

function mockEmptyFleet() {
  vi.mocked(useRosStore).mockImplementation(
    (selector: (s: RosState) => unknown) => selector({ connectionStates: {} })
  );
}

function mockFleetWithBot() {
  vi.mocked(useRosStore).mockImplementation(
    (selector: (s: RosState) => unknown) =>
      selector({
        connectionStates: {
          'bot-1': { state: 'connected', error: null },
        },
      })
  );
}

function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    mockEmptyFleet();
  });

  it('renders the fleet section heading', () => {
    renderSidebar();
    expect(screen.getByText(/fleet/i)).toBeInTheDocument();
  });

  it('renders empty state when no robots connected', () => {
    renderSidebar();
    expect(screen.getByText(/no robots connected/i)).toBeInTheDocument();
  });

  it('renders the Map nav item linking to /map', () => {
    renderSidebar();
    const mapLink = screen.getByRole('link', { name: /map/i });
    expect(mapLink).toBeInTheDocument();
    expect(mapLink).toHaveAttribute('href', '/map');
  });

  it('renders the Settings nav item', () => {
    renderSidebar();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('renders the ThemeDropdown', () => {
    renderSidebar();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders robot rows with badges when robots are connected', () => {
    mockFleetWithBot();
    renderSidebar();
    expect(screen.getByText('bot-1')).toBeInTheDocument();
  });

  it('robot row links to /robot/:robotId', () => {
    mockFleetWithBot();
    renderSidebar();
    expect(screen.getByRole('link', { name: /bot-1/i })).toHaveAttribute(
      'href',
      '/robot/bot-1'
    );
  });
});
