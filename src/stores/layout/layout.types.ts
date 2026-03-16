import type {
  GridItemLayout,
  LayoutState,
  PersistedViewLayout,
} from '@/features/panels/panel.types';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface LayoutStoreState {
  layouts: LayoutState;
  editMode: boolean;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

export interface LayoutStoreActions {
  setBreakpointLayouts(
    viewId: string,
    breakpoint: 'lg' | 'md' | 'sm',
    items: GridItemLayout[]
  ): void;
  addPanel(viewId: string, typeId: string): string;
  removePanel(viewId: string, panelId: string): void;
  resetLayout(viewId: string): void;
  setEditMode(enabled: boolean): void;
  getViewLayout(viewId: string): PersistedViewLayout;
}
