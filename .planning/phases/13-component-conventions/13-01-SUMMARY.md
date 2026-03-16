---
phase: 13-component-conventions
plan: 01
subsystem: ui
tags: [react, component-structure, refactoring, types]

requires:
  - phase: 12-integration-polish
    provides: all components in their original form
provides:
  - PilotHud decomposed into 6 focused files + types
  - ConnectionsSidebar decomposed into 3 focused files + types
  - Header decomposed into 3 focused files + types
  - Convention pattern established for remaining plans
affects: [13-02, 13-03]

tech-stack:
  added: []
  patterns:
    - 'One component per .tsx file with .types.ts sibling'
    - 'Flat sibling sub-component extraction pattern'

key-files:
  created:
    - src/features/pilot-mode/components/PilotHud.types.ts
    - src/features/pilot-mode/components/HudPanel.tsx
    - src/features/pilot-mode/components/ConnectionBadges.tsx
    - src/features/pilot-mode/components/VelocityReadout.tsx
    - src/features/pilot-mode/components/HeadingIndicator.tsx
    - src/features/pilot-mode/components/BatteryIndicator.tsx
    - src/features/connections/components/ConnectionsSidebar.types.ts
    - src/features/connections/components/RobotRow.tsx
    - src/features/connections/components/DeleteConfirmDialog.tsx
    - src/components/layout/Header.types.ts
    - src/components/layout/NavItem.tsx
    - src/components/layout/ActiveRobotBadge.tsx
  modified:
    - src/features/pilot-mode/components/PilotHud.tsx
    - src/features/connections/components/ConnectionsSidebar.tsx
    - src/components/layout/Header.tsx

key-decisions:
  - 'HudPanelProps added to types file (was implicit in original)'
  - 'formatHeading utility kept with HeadingIndicator (not shared)'
  - 'No barrel export changes needed — sub-components only used internally'

patterns-established:
  - 'One component per .tsx, types in PascalCase .types.ts sibling'

issues-created: []

duration: 4min
completed: 2026-03-16
---

# Phase 13 Plan 01: Decompose Worst Offenders Summary

**Extracted 12 sub-component/types files from 3 multi-component .tsx files — PilotHud (6→1+5), ConnectionsSidebar (3→1+2), Header (3→1+2)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T17:59:52Z
- **Completed:** 2026-03-16T18:04:13Z
- **Tasks:** 3
- **Files created:** 12
- **Files modified:** 3

## Accomplishments

- PilotHud.tsx reduced from 6 components + 5 interfaces to pure composition — sub-components in 5 sibling files, all types in PilotHud.types.ts
- ConnectionsSidebar.tsx reduced from 3 components + 2 interfaces — RobotRow and DeleteConfirmDialog extracted with types
- Header.tsx reduced from 3 components + 1 interface — NavItem and ActiveRobotBadge extracted with types
- Convention pattern established: one-component-per-file with PascalCase .types.ts siblings

## Task Commits

Each task was committed atomically:

1. **Task 1: Decompose PilotHud.tsx** — `dc58d32` (refactor)
2. **Task 2: Decompose ConnectionsSidebar.tsx** — `0fde75e` (refactor)
3. **Task 3: Decompose Header.tsx** — `187eca2` (refactor)

## Files Created/Modified

**Created (12 files):**

- `src/features/pilot-mode/components/PilotHud.types.ts` — 6 interfaces (ConnectionBadgesProps, VelocityReadoutProps, HeadingIndicatorProps, BatteryIndicatorProps, PilotHudProps, HudPanelProps)
- `src/features/pilot-mode/components/HudPanel.tsx` — Styling wrapper
- `src/features/pilot-mode/components/ConnectionBadges.tsx` — ROS/WebRTC status badges
- `src/features/pilot-mode/components/VelocityReadout.tsx` — Velocity display
- `src/features/pilot-mode/components/HeadingIndicator.tsx` — Heading compass + formatHeading utility
- `src/features/pilot-mode/components/BatteryIndicator.tsx` — Battery level display
- `src/features/connections/components/ConnectionsSidebar.types.ts` — DeleteConfirmDialogProps, RobotRowProps
- `src/features/connections/components/RobotRow.tsx` — Robot connection row with status/actions
- `src/features/connections/components/DeleteConfirmDialog.tsx` — Confirmation dialog for robot removal
- `src/components/layout/Header.types.ts` — NavItemProps
- `src/components/layout/NavItem.tsx` — Navigation link component
- `src/components/layout/ActiveRobotBadge.tsx` — Active robot indicator

**Modified (3 files):**

- `src/features/pilot-mode/components/PilotHud.tsx` — Reduced to main composition
- `src/features/connections/components/ConnectionsSidebar.tsx` — Reduced to main component
- `src/components/layout/Header.tsx` — Reduced to main component

## Decisions Made

- HudPanelProps interface added to types file (was implicitly typed in original) — follows strict "all types extracted" rule
- formatHeading utility kept with HeadingIndicator (not shared across components, no need for separate utils file)
- No barrel export changes — all sub-components are only used by their parent, so no index.ts updates needed

## Deviations from Plan

None — plan executed exactly as written.

Note: `npm run typecheck` script does not exist; verification used `npx tsc --noEmit` directly.

## Issues Encountered

None

## Next Phase Readiness

- Pattern established for remaining plans (13-02, 13-03)
- Ready for 13-02: Decompose remaining multi-component files

---

_Phase: 13-component-conventions_
_Completed: 2026-03-16_
