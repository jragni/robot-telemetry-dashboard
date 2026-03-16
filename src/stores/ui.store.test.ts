import { describe, it, expect, beforeEach } from 'vitest';

import { useUIStore } from './ui.store';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialState = {
  sidebarOpen: true,
  theme: 'dark' as const,
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState(initialState);
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  describe('initial state', () => {
    it('has sidebarOpen set to true by default', () => {
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('has theme set to "dark" by default', () => {
      expect(useUIStore.getState().theme).toBe('dark');
    });
  });

  // -------------------------------------------------------------------------
  // toggleSidebar
  // -------------------------------------------------------------------------

  describe('toggleSidebar', () => {
    it('closes the sidebar when it is open', () => {
      useUIStore.setState({ sidebarOpen: true });
      useUIStore.getState().toggleSidebar();

      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it('opens the sidebar when it is closed', () => {
      useUIStore.setState({ sidebarOpen: false });
      useUIStore.getState().toggleSidebar();

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('toggles correctly on successive calls', () => {
      useUIStore.getState().toggleSidebar(); // true -> false
      useUIStore.getState().toggleSidebar(); // false -> true

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // setSidebarOpen
  // -------------------------------------------------------------------------

  describe('setSidebarOpen', () => {
    it('sets sidebarOpen to the provided value (true)', () => {
      useUIStore.setState({ sidebarOpen: false });
      useUIStore.getState().setSidebarOpen(true);

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('sets sidebarOpen to the provided value (false)', () => {
      useUIStore.getState().setSidebarOpen(false);

      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it('is idempotent when setting the same value twice', () => {
      useUIStore.getState().setSidebarOpen(true);
      useUIStore.getState().setSidebarOpen(true);

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // setTheme
  // -------------------------------------------------------------------------

  describe('setTheme', () => {
    it('switches the theme to "light"', () => {
      useUIStore.getState().setTheme('light');

      expect(useUIStore.getState().theme).toBe('light');
    });

    it('switches the theme back to "dark"', () => {
      useUIStore.setState({ theme: 'light' });
      useUIStore.getState().setTheme('dark');

      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('is idempotent when setting the same theme', () => {
      useUIStore.getState().setTheme('dark');
      useUIStore.getState().setTheme('dark');

      expect(useUIStore.getState().theme).toBe('dark');
    });
  });
});
