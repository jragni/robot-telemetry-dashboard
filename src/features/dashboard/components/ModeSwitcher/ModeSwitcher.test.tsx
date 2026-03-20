import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useModeStore } from '../../stores/modeStore';

import { ModeSwitcher } from './ModeSwitcher';

vi.mock('../../stores/modeStore', () => ({
  useModeStore: vi.fn(),
}));

const mockSwitchMode = vi.fn();

const makeModeStore = (currentMode: 'dashboard' | 'pilot' | 'engineer') => ({
  currentMode,
  switchMode: mockSwitchMode,
});

describe('ModeSwitcher', () => {
  beforeEach(() => {
    mockSwitchMode.mockClear();
    vi.mocked(useModeStore).mockReturnValue(makeModeStore('dashboard'));
  });

  it('renders DASHBOARD, PILOT, and ENGINEER buttons on desktop', () => {
    render(<ModeSwitcher />);
    expect(
      screen.getByRole('button', { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pilot/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /engineer/i })
    ).toBeInTheDocument();
  });

  it('highlights the active mode button', () => {
    vi.mocked(useModeStore).mockReturnValue(makeModeStore('pilot'));
    render(<ModeSwitcher />);
    const pilotBtn = screen.getByRole('button', { name: /pilot/i });
    expect(pilotBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('non-active mode buttons are not highlighted', () => {
    vi.mocked(useModeStore).mockReturnValue(makeModeStore('pilot'));
    render(<ModeSwitcher />);
    expect(screen.getByRole('button', { name: /dashboard/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', { name: /engineer/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('clicking a mode button calls switchMode with that mode', () => {
    render(<ModeSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: /pilot/i }));
    expect(mockSwitchMode).toHaveBeenCalledWith('pilot');
  });

  it('clicking ENGINEER calls switchMode with engineer', () => {
    render(<ModeSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: /engineer/i }));
    expect(mockSwitchMode).toHaveBeenCalledWith('engineer');
  });

  it('is keyboard accessible — all buttons are focusable', () => {
    render(<ModeSwitcher />);
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      expect(btn).not.toHaveAttribute('tabIndex', '-1');
    }
  });

  it('ENGINEER button is hidden on mobile viewport', () => {
    render(<ModeSwitcher isMobile={true} />);
    expect(
      screen.queryByRole('button', { name: /engineer/i })
    ).not.toBeInTheDocument();
  });

  it('DASHBOARD and PILOT buttons are visible on mobile', () => {
    render(<ModeSwitcher isMobile={true} />);
    expect(
      screen.getByRole('button', { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pilot/i })).toBeInTheDocument();
  });

  it('renders a navigation landmark with accessible label', () => {
    render(<ModeSwitcher />);
    expect(
      screen.getByRole('navigation', { name: /mode switcher/i })
    ).toBeInTheDocument();
  });
});
