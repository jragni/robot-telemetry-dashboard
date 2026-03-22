export interface UIState {
  immersiveMode: boolean;
}

export interface UIActions {
  setImmersiveMode: (value: boolean) => void;
}

export type UIStore = UIState & UIActions;
