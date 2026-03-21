import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DashboardView } from './DashboardView';
import { useModeStore } from './stores/modeStore';

import { useMobile } from '@/shared/hooks/use-mobile';

// ── Store mocks ──────────────────────────────────────────────────────────────

vi.mock('./stores/modeStore', () => ({
  useModeStore: vi.fn(),
}));

vi.mock('@/shared/hooks/use-mobile', () => ({
  useMobile: vi.fn(),
}));

// ── Mode component mocks ─────────────────────────────────────────────────────

vi.mock('./modes/DashboardMode/DashboardMode', () => ({
  DashboardMode: () => <div data-testid="mock-dashboard-mode" />,
}));

vi.mock('./modes/PilotMode/PilotMode', () => ({
  PilotMode: ({ isMobile }: { isMobile: boolean }) => (
    <div data-testid="mock-pilot-mode" data-is-mobile={String(isMobile)} />
  ),
}));

vi.mock('./modes/EngineerMode/EngineerMode', () => ({
  EngineerMode: () => <div data-testid="mock-engineer-mode" />,
}));

vi.mock('./components/ModeSwitcher/ModeSwitcher', () => ({
  ModeSwitcher: () => <div data-testid="mock-mode-switcher" />,
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

// DashboardView calls useModeStore as a selector: useModeStore(s => s.currentMode)
// So we mock it as a function that accepts a selector and applies it to the store state.
function mockModeStore(currentMode: 'dashboard' | 'pilot' | 'engineer') {
  const state = { currentMode, switchMode: vi.fn() };
  vi.mocked(useModeStore).mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (selector: (s: typeof state) => any) => selector(state)
  );
}

describe('DashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Fix 5: Mode switcher header hidden on mobile ──────────────────────────

  describe('Fix 5 — mode switcher header visibility', () => {
    it('renders mode-switcher-header on desktop', () => {
      vi.mocked(useMobile).mockReturnValue(false);
      mockModeStore('dashboard');

      render(<DashboardView />);

      expect(screen.getByTestId('mode-switcher-header')).toBeInTheDocument();
    });

    it('hides mode-switcher-header on mobile', () => {
      vi.mocked(useMobile).mockReturnValue(true);
      mockModeStore('dashboard');

      render(<DashboardView />);

      expect(
        screen.queryByTestId('mode-switcher-header')
      ).not.toBeInTheDocument();
    });

    it('mode-switcher-header contains ModeSwitcher when visible', () => {
      vi.mocked(useMobile).mockReturnValue(false);
      mockModeStore('dashboard');

      render(<DashboardView />);

      const header = screen.getByTestId('mode-switcher-header');
      expect(
        header.querySelector('[data-testid="mock-mode-switcher"]')
      ).toBeInTheDocument();
    });
  });

  // ── Fix 2: Engineer mode hidden on mobile ────────────────────────────────

  describe('Fix 2 — engineer mode guard', () => {
    it('renders EngineerMode on desktop when currentMode is engineer', () => {
      vi.mocked(useMobile).mockReturnValue(false);
      mockModeStore('engineer');

      render(<DashboardView />);

      expect(screen.getByTestId('mock-engineer-mode')).toBeInTheDocument();
      expect(
        screen.queryByTestId('mock-dashboard-mode')
      ).not.toBeInTheDocument();
    });

    it('falls back to DashboardMode on mobile when currentMode is engineer', () => {
      vi.mocked(useMobile).mockReturnValue(true);
      mockModeStore('engineer');

      render(<DashboardView />);

      expect(screen.getByTestId('mock-dashboard-mode')).toBeInTheDocument();
      expect(
        screen.queryByTestId('mock-engineer-mode')
      ).not.toBeInTheDocument();
    });

    it('never renders EngineerMode when isMobile is true', () => {
      vi.mocked(useMobile).mockReturnValue(true);
      mockModeStore('engineer');

      render(<DashboardView />);

      expect(
        screen.queryByTestId('mock-engineer-mode')
      ).not.toBeInTheDocument();
    });

    it('renders PilotMode correctly on mobile without engineer interference', () => {
      vi.mocked(useMobile).mockReturnValue(true);
      mockModeStore('pilot');

      render(<DashboardView />);

      expect(screen.getByTestId('mock-pilot-mode')).toBeInTheDocument();
      expect(
        screen.queryByTestId('mock-engineer-mode')
      ).not.toBeInTheDocument();
    });

    it('renders DashboardMode on mobile when currentMode is dashboard', () => {
      vi.mocked(useMobile).mockReturnValue(true);
      mockModeStore('dashboard');

      render(<DashboardView />);

      expect(screen.getByTestId('mock-dashboard-mode')).toBeInTheDocument();
    });
  });
});
