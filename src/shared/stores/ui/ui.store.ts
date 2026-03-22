import { create } from 'zustand';

import type { UIStore } from './ui.types';

export const useUIStore = create<UIStore>((set) => ({
  immersiveMode: false,

  setImmersiveMode: (value: boolean) => {
    set({ immersiveMode: value });
  },
}));
