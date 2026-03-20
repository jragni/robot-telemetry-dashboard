# Phase 6: Panel System — Summary

## Workflow

SPEC > RED > GREEN > SWEEP

## What Was Built

### 3-Mode Architecture (src/features/dashboard/)

| Mode          | File                                  | Tests | Description                                                 |
| ------------- | ------------------------------------- | ----- | ----------------------------------------------------------- |
| DashboardMode | modes/DashboardMode/DashboardMode.tsx | 13    | Fleet overview with fixed grid layout, sovereign map panel  |
| PilotMode     | modes/PilotMode/PilotMode.tsx         | 15    | FPOV with video stream, HUD overlays, instrument sidebar    |
| EngineerMode  | modes/EngineerMode/EngineerMode.tsx   | 10    | Fully customizable react-grid-layout with dynamic rowHeight |

### Components (src/features/dashboard/components/)

| Component    | File                          | Tests | Description                                          |
| ------------ | ----------------------------- | ----- | ---------------------------------------------------- |
| ModeSwitcher | ModeSwitcher/ModeSwitcher.tsx | 9     | Mode toggle bar (desktop horizontal, mobile compact) |
| PanelFrame   | PanelFrame/PanelFrame.tsx     | 15    | Panel wrapper with drag handle, close, context menu  |
| PanelPicker  | PanelPicker/PanelPicker.tsx   | 11    | Add-panel dialog filtered by mode                    |
| TabGroup     | TabGroup/TabGroup.tsx         | 10    | Tab bar for grouped panels within a frame            |
| EmptyState   | EmptyState/EmptyState.tsx     | —     | Mode-specific empty state messaging                  |

### HUD Overlays (src/features/dashboard/modes/PilotMode/overlays/)

| Overlay              | File                                          | Tests | Description                          |
| -------------------- | --------------------------------------------- | ----- | ------------------------------------ |
| InstrumentHudOverlay | InstrumentHudOverlay/InstrumentHudOverlay.tsx | 7     | IMU telemetry overlay for pilot mode |
| LidarHudOverlay      | LidarHudOverlay/LidarHudOverlay.tsx           | 7     | Lidar scan overlay for pilot mode    |

### Stores (src/features/dashboard/stores/)

| Store       | File           | Tests | Description                                            |
| ----------- | -------------- | ----- | ------------------------------------------------------ |
| modeStore   | modeStore.ts   | 7     | Mode switching with sessionStorage persistence         |
| layoutStore | layoutStore.ts | 14    | Per-mode layout persistence with skipNextSaveRef guard |

### Registry (src/features/dashboard/registry/)

| File              | Tests | Description                                            |
| ----------------- | ----- | ------------------------------------------------------ |
| panelRegistry.ts  | 14    | Panel type registry mapping IDs to components/metadata |
| defaultLayouts.ts | —     | Default grid layouts per mode                          |

### Panel Adapters (src/features/dashboard/panels/)

| File                       | Description                              |
| -------------------------- | ---------------------------------------- |
| ImuWidgetPanel.tsx         | Wraps ImuWidget for panel system         |
| LidarWidgetPanel.tsx       | Wraps LidarWidget for panel system       |
| DataPlotWidgetPanel.tsx    | Wraps DataPlotWidget for panel system    |
| DepthCameraWidgetPanel.tsx | Wraps DepthCameraWidget for panel system |
| TopicListWidgetPanel.tsx   | Wraps TopicListWidget for panel system   |

### Placeholders (src/features/dashboard/placeholders/)

| File                               | Description                       |
| ---------------------------------- | --------------------------------- |
| MapWidgetPlaceholder.tsx           | Placeholder for future map widget |
| VideoWidgetPlaceholder.tsx         | Placeholder for future video      |
| FleetStatusWidgetPlaceholder.tsx   | Placeholder for fleet status      |
| RobotControlsWidgetPlaceholder.tsx | Placeholder for robot controls    |
| AlertsWidgetPlaceholder.tsx        | Placeholder for alerts panel      |

### Types

| File                        | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| types/panel-system.types.ts | DashboardMode, PanelContentProps, PanelRegistryEntry |
| stores/modeStore.types.ts   | ModeState interface                                  |
| stores/layoutStore.types.ts | LayoutState interface                                |
| components/_/_.types.ts     | Component prop interfaces (5 files)                  |
| modes/_/_.types.ts          | Mode prop interfaces (4 files)                       |

## Quality Gate

| Check      | Result                     |
| ---------- | -------------------------- |
| Lint       | 0 errors, 0 warnings       |
| TypeScript | Clean (--noEmit)           |
| Tests      | 348/348 passed (132 new)   |
| Build      | Success (321KB gzip 102KB) |

## Sweep Fixes Applied

- Moved inline types from `.tsx` files to `.types.ts` (ViewMode, EmptyStateProps, PanelConfig, ModeButtonConfig)
- Extracted store interfaces to dedicated `.types.ts` files (ModeState, LayoutState)
- Replaced 3-way OR comparison with `[].includes()` pattern in `modeStore.ts`
- Replaced all `{condition && (` patterns with `<Show when={}>` component in dashboard feature (7 instances)

## Conventions Verified

- One component per `.tsx` file
- All types in `.types.ts` files (no inline interfaces)
- No barrel files (no `index.ts` re-exports)
- Named exports only (no default exports)
- `Show` component for all conditional rendering
- `[].includes()` for 3+ OR comparisons
- Stores in domain folders with separate `.types.ts`
- ISS-008 prevention: `rowHeight` derived from `window.innerHeight` (not container)
- `skipNextSaveRef` guard on layout reset (prevents save-after-reset race)
- Layout persistence saves per mode independently

## Key Architecture Decisions

- **3-mode paradigm**: Dashboard (fleet overview), Pilot (FPOV), Engineer (customizable) — inspired by C2/Foxglove patterns
- **Sovereign panels**: Map panel in Dashboard mode cannot be closed or tabbed
- **Panel registry**: Centralized registration enables mode-filtered panel picking
- **skipNextSaveRef**: MutableRefObject (not reactive state) prevents onLayoutChange from saving during programmatic resets
- **ISS-008 prevention**: rowHeight uses `window.innerHeight` with debounced resize, never container measurements
