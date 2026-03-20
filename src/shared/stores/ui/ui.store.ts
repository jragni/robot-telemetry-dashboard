import { create } from 'zustand';

import type { UIStore } from './ui.types';

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
}));
