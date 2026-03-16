// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

export interface UIActions {
  toggleSidebar(): void;
  setSidebarOpen(open: boolean): void;
  setTheme(theme: 'dark' | 'light'): void;
}
