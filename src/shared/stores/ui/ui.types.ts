export interface UIState {
  sidebarOpen: boolean;
}

export interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export type UIStore = UIState & UIActions;
