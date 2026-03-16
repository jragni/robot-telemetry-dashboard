import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { LayoutStoreActions, LayoutStoreState } from './layout.types';

import { STORAGE_KEYS } from '@/config/constants';
import {
  createDefaultLayout,
  createDefaultViewLayout,
} from '@/features/panels/panel.defaults';
import { PANEL_REGISTRY } from '@/features/panels/panel.registry';
import type {
  GridItemLayout,
  LayoutState,
  PersistedViewLayout,
  PanelInstance,
  PanelTypeId,
} from '@/features/panels/panel.types';

// ---------------------------------------------------------------------------
// Full store type
// ---------------------------------------------------------------------------

type LayoutStore = LayoutStoreState & LayoutStoreActions;

// ---------------------------------------------------------------------------
// Fallback for unknown viewId lookups
// ---------------------------------------------------------------------------

const EMPTY_VIEW_LAYOUT: PersistedViewLayout = {
  breakpoints: { lg: [], md: [], sm: [] },
  panels: [],
};

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: LayoutStoreState = {
  layouts: createDefaultLayout(),
  editMode: false,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setBreakpointLayouts(viewId, breakpoint, items) {
          set(
            (state) => {
              const existing =
                state.layouts[viewId as keyof LayoutState] ?? EMPTY_VIEW_LAYOUT;
              return {
                layouts: {
                  ...state.layouts,
                  [viewId]: {
                    ...existing,
                    breakpoints: {
                      ...existing.breakpoints,
                      [breakpoint]: items,
                    },
                  },
                },
              };
            },
            false,
            'layout/setBreakpointLayouts'
          );
        },

        addPanel(viewId, typeId) {
          const id = crypto.randomUUID();
          const panel: PanelInstance = { id, type: typeId as PanelTypeId };

          const registryEntry =
            PANEL_REGISTRY[typeId as keyof typeof PANEL_REGISTRY];
          const w = registryEntry?.defaultSize.w ?? 4;
          const h = registryEntry?.defaultSize.h ?? 4;
          const minW = registryEntry?.defaultSize.minW;
          const minH = registryEntry?.defaultSize.minH;

          const gridItem: GridItemLayout = {
            i: id,
            x: 0,
            y: Infinity,
            w,
            h,
            ...(minW !== undefined && { minW }),
            ...(minH !== undefined && { minH }),
          };

          set(
            (state) => {
              const existing =
                state.layouts[viewId as keyof LayoutState] ?? EMPTY_VIEW_LAYOUT;
              return {
                layouts: {
                  ...state.layouts,
                  [viewId]: {
                    breakpoints: {
                      lg: [...existing.breakpoints.lg, gridItem],
                      md: [...existing.breakpoints.md, gridItem],
                      sm: [...existing.breakpoints.sm, gridItem],
                    },
                    panels: [...existing.panels, panel],
                  },
                },
              };
            },
            false,
            'layout/addPanel'
          );

          return id;
        },

        removePanel(viewId, panelId) {
          set(
            (state) => {
              const existing = state.layouts[viewId as keyof LayoutState];
              if (!existing) return state;

              return {
                layouts: {
                  ...state.layouts,
                  [viewId]: {
                    breakpoints: {
                      lg: existing.breakpoints.lg.filter(
                        (item) => item.i !== panelId
                      ),
                      md: existing.breakpoints.md.filter(
                        (item) => item.i !== panelId
                      ),
                      sm: existing.breakpoints.sm.filter(
                        (item) => item.i !== panelId
                      ),
                    },
                    panels: existing.panels.filter((p) => p.id !== panelId),
                  },
                },
              };
            },
            false,
            'layout/removePanel'
          );
        },

        resetLayout(viewId) {
          const freshLayout = createDefaultViewLayout(
            viewId as Parameters<typeof createDefaultViewLayout>[0]
          );
          set(
            (state) => ({
              layouts: {
                ...state.layouts,
                [viewId]: freshLayout,
              },
            }),
            false,
            'layout/resetLayout'
          );
        },

        setEditMode(enabled) {
          set({ editMode: enabled }, false, 'layout/setEditMode');
        },

        getViewLayout(viewId) {
          const { layouts } = get();
          return layouts[viewId as keyof LayoutState] ?? EMPTY_VIEW_LAYOUT;
        },
      }),
      {
        name: STORAGE_KEYS.PANEL_LAYOUTS,
        version: 1,
        migrate(persistedState, version) {
          if (version === 0) {
            // Future migration slot — return state as-is
            return persistedState as LayoutStoreState;
          }
          return persistedState as LayoutStoreState;
        },
      }
    ),
    { name: 'LayoutStore' }
  )
);
