import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type * as ReactRouter from 'react-router';

import { FleetOverview } from './FleetOverview';

import { useRosStore } from '@/shared/stores/ros/ros.store';

vi.mock('@/shared/stores/ros/ros.store', () => ({
  useRosStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

interface RosState {
  connectionStates: Record<string, { state: string; error: string | null }>;
}

function mockEmptyFleet() {
  vi.mocked(useRosStore).mockImplementation(
    (selector: (s: RosState) => unknown) => selector({ connectionStates: {} })
  );
}

function mockFleet(
  bots: Record<string, { state: string; error: string | null }>
) {
  vi.mocked(useRosStore).mockImplementation(
    (selector: (s: RosState) => unknown) => selector({ connectionStates: bots })
  );
}

describe('FleetOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmptyFleet();
  });

  it('renders empty state when no robots connected', () => {
    render(
      <MemoryRouter>
        <FleetOverview />
      </MemoryRouter>
    );
    expect(screen.getByText(/no robots connected/i)).toBeInTheDocument();
  });

  it('renders robot cards when robots are connected', () => {
    mockFleet({
      'bot-1': { state: 'connected', error: null },
      'bot-2': { state: 'disconnected', error: null },
    });
    render(
      <MemoryRouter>
        <FleetOverview />
      </MemoryRouter>
    );
    expect(screen.getByText('bot-1')).toBeInTheDocument();
    expect(screen.getByText('bot-2')).toBeInTheDocument();
  });

  it('shows a badge with status for each robot', () => {
    mockFleet({ 'bot-1': { state: 'connected', error: null } });
    render(
      <MemoryRouter>
        <FleetOverview />
      </MemoryRouter>
    );
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  it('navigates to /robot/:id when a card is clicked', () => {
    mockFleet({ 'bot-1': { state: 'connected', error: null } });
    render(
      <MemoryRouter>
        <FleetOverview />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('bot-1'));
    expect(mockNavigate).toHaveBeenCalledWith('/robot/bot-1');
  });
});
