import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { UIActions, UIState } from './ui.types';

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
