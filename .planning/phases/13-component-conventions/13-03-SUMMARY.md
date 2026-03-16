---
phase: 13-component-conventions
plan: 03
subsystem: ui
tags: [react, component-structure, refactoring, types]

requires:
  - phase: 13-01
    provides: convention pattern established
  - phase: 13-02
    provides: all multi-component files decomposed
provides:
  - Zero inline interfaces in any .tsx component file (excluding shadcn/ui and tests)
  - Every component's types co-located in {ComponentName}.types.ts
  - Phase 13 complete
affects: []

tech-stack:
  added: []
  patterns:
    - 'All Props interfaces in co-located .types.ts files'
    - 'import type { XxxProps } from ./Xxx.types pattern'
    - 'LoadingSpinner exports spinnerVariants for types file VariantProps usage'

key-files:
  created:
    - src/features/pilot-mode/components/PilotLayout.types.ts
    - src/features/pilot-mode/components/PilotMobileLayout.types.ts
    - src/features/pilot-mode/components/PilotExitButton.types.ts
    - src/features/pilot-mode/components/PilotLidarMinimap.types.ts
    - src/features/panels/components/PanelToolbar.types.ts
    - src/features/panels/components/PanelPlaceholder.types.ts
    - src/features/panels/components/PanelFrame.types.ts
    - src/features/panels/components/PanelGrid.types.ts
    - src/features/panels/components/AddPanelDialog.types.ts
    - src/features/recording/components/RecordingControls.types.ts
    - src/features/telemetry/topic-list/components/TopicRow.types.ts
    - src/features/telemetry/shared/NoConnectionOverlay.types.ts
    - src/features/telemetry/imu/components/ImuPlotView.types.ts
    - src/features/fleet/components/SplitPilotGrid.types.ts
    - src/features/fleet/components/UnifiedCommandPanel.types.ts
    - src/features/fleet/components/RobotCard.types.ts
    - src/features/fleet/components/MiniPilotView.types.ts
    - src/features/fleet/components/FleetGrid.types.ts
    - src/features/control/components/VelocitySliders.types.ts
    - src/features/control/components/TopicSelector.types.ts
    - src/features/control/components/ControlPad.types.ts
    - src/components/shared/StatusIndicator.types.ts
    - src/components/shared/LoadingSpinner.types.ts
    - src/components/shared/DataCard.types.ts
    - src/router/guards/RequiresConnection.types.ts
  modified:
    - src/features/pilot-mode/components/PilotLayout.tsx
    - src/features/pilot-mode/components/PilotMobileLayout.tsx
    - src/features/pilot-mode/components/PilotExitButton.tsx
    - src/features/pilot-mode/components/PilotLidarMinimap.tsx
    - src/features/panels/components/PanelToolbar.tsx
    - src/features/panels/components/PanelPlaceholder.tsx
    - src/features/panels/components/PanelFrame.tsx
    - src/features/panels/components/PanelGrid.tsx
    - src/features/panels/components/AddPanelDialog.tsx
    - src/features/recording/components/RecordingControls.tsx
    - src/features/telemetry/topic-list/components/TopicRow.tsx
    - src/features/telemetry/shared/NoConnectionOverlay.tsx
    - src/features/telemetry/imu/components/ImuPlotView.tsx
    - src/features/fleet/components/SplitPilotGrid.tsx
    - src/features/fleet/components/UnifiedCommandPanel.tsx
    - src/features/fleet/components/RobotCard.tsx
    - src/features/fleet/components/MiniPilotView.tsx
    - src/features/fleet/components/FleetGrid.tsx
    - src/features/control/components/VelocitySliders.tsx
    - src/features/control/components/TopicSelector.tsx
    - src/features/control/components/ControlPad.tsx
    - src/components/shared/StatusIndicator.tsx
    - src/components/shared/LoadingSpinner.tsx
    - src/components/shared/DataCard.tsx
    - src/router/guards/RequiresConnection.tsx
---

## Results

### Task 1 — pilot-mode, panels, recording (commit e167891)

Extracted 10 interfaces from 10 .tsx files to co-located .types.ts files.

### Task 2 — telemetry, fleet, control (commit ea03fd1)

Extracted 12 interfaces from 11 .tsx files (ControlPad had 2: ControlPadProps + DirButtonConfig).

### Task 3 — shared, layout, router (commit 72305a8)

Extracted 4 interfaces from 4 .tsx files. LoadingSpinner required exporting `spinnerVariants` from the .tsx so the types file could reference `VariantProps<typeof spinnerVariants>`.

### Verification

- `npm run lint`: 0 errors, 12 warnings (all pre-existing)
- `npx tsc --noEmit`: clean
- `npm test -- --run`: 510/510 passed
- `npm run build`: success
- Inline interface scan: **0 results** (excluding shadcn/ui and tests)

### Deviations

- LoadingSpinner: `spinnerVariants` was made a named export from the .tsx so the .types.ts file could import it for the `VariantProps` extension. This is the only behavioral export change, and it has no runtime effect.

### Summary

25 new .types.ts files created, 25 .tsx files updated. Zero inline interfaces remain in any component .tsx file. Phase 13: Component Conventions is complete.
