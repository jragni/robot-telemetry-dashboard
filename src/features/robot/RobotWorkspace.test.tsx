import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import { useRobotLayoutStore } from './robotLayoutStore';
import { RobotWorkspace } from './RobotWorkspace';

import { DEFAULT_ROBOT_LAYOUT } from '@/features/dashboard/registry/defaultLayouts';

vi.mock('./robotLayoutStore', () => ({
  useRobotLayoutStore: vi.fn(),
}));

vi.mock('react-grid-layout', () => ({
  default: vi.fn(
    ({ children, width }: { children: React.ReactNode; width?: number }) => (
      <div data-testid="react-grid-layout" data-width={width}>
        {children}
      </div>
    )
  ),
  WidthProvider: (Component: React.ComponentType) => Component,
}));

const mockSaveLayout = vi.fn();
const mockResetLayout = vi.fn();
const mockSkipRef = { current: false };

function makeMockStore() {
  return {
    layouts: {},
    skipNextSaveRef: mockSkipRef,
    saveLayout: mockSaveLayout,
    resetLayout: mockResetLayout,
    getLayout: (_robotId: string) => DEFAULT_ROBOT_LAYOUT,
  };
}

function renderWorkspace(robotId = 'bot-1') {
  vi.mocked(useRobotLayoutStore).mockReturnValue(makeMockStore());
  return render(
    <MemoryRouter initialEntries={[`/robot/${robotId}`]}>
      <Routes>
        <Route path="/robot/:robotId" element={<RobotWorkspace />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RobotWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSkipRef.current = false;
  });

  it('renders the panel grid', () => {
    renderWorkspace();
    expect(screen.getByTestId('react-grid-layout')).toBeInTheDocument();
  });

  it('renders the [+ Add Panel] toolbar button', () => {
    renderWorkspace();
    expect(
      screen.getByRole('button', { name: /add panel/i })
    ).toBeInTheDocument();
  });

  it('renders default panels for the robot', () => {
    renderWorkspace();
    for (const item of DEFAULT_ROBOT_LAYOUT) {
      expect(screen.getByTestId(`panel-${item.i}`)).toBeInTheDocument();
    }
  });

  it('receives width prop (uses useElementSize, not WidthProvider)', () => {
    renderWorkspace();
    const grid = screen.getByTestId('react-grid-layout');
    // data-width is present (value is 0 in jsdom)
    expect(grid).toHaveAttribute('data-width');
  });

  it('shows mobile guard message on narrow viewport', () => {
    vi.mocked(useRobotLayoutStore).mockReturnValue(makeMockStore());
    render(
      <MemoryRouter initialEntries={['/robot/bot-1']}>
        <Routes>
          <Route path="/robot/:robotId" element={<RobotWorkspace isMobile />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/desktop viewport/i)).toBeInTheDocument();
    expect(screen.queryByTestId('react-grid-layout')).not.toBeInTheDocument();
  });

  it('is wrapped in data-testid="robot-workspace"', () => {
    renderWorkspace();
    expect(screen.getByTestId('robot-workspace')).toBeInTheDocument();
  });
});
