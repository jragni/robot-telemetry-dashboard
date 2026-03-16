import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface UIActions {
  toggleSidebar(): void;
  setSidebarOpen(open: boolean): void;
  setTheme(theme: 'dark' | 'light'): void;
}

// ---------------------------------------------------------------------------
// Full store type
// ---------------------------------------------------------------------------

type UIStore = UIState & UIActions;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'dark',
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        toggleSidebar() {
          set(
            (prev) => ({ sidebarOpen: !prev.sidebarOpen }),
            false,
            'ui/toggleSidebar'
          );
        },

        setSidebarOpen(open) {
          set({ sidebarOpen: open }, false, 'ui/setSidebarOpen');
        },

        setTheme(theme) {
          set({ theme }, false, 'ui/setTheme');
        },
      }),
      { name: 'rtd-ui' }
    ),
    { name: 'UIStore' }
  )
);
