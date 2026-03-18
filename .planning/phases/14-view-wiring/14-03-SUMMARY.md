---
phase: 14-view-wiring
plan: 03
subsystem: ui
tags: [context-menu, shadcn, radix, panel-management, right-click]

requires:
  - phase: 14-02
    provides: always-on drag/resize with 4-corner handles
provides:
  - Right-click context menu on panels and empty grid space
  - PanelToolbar removed — zero persistent UI for panel management
  - Reset layout properly restores default panel sizes
  - editMode fully removed from layout store
affects: [14-04]

tech-stack:
  added:
    - '@radix-ui/react-context-menu (via shadcn)'
  patterns:
    - 'PanelContextMenu wraps grid items and container for right-click actions'
    - 'skipNextSaveRef prevents onLayoutChange from overwriting reset defaults'

key-files:
  created:
    - src/components/ui/context-menu.tsx
    - src/features/panels/components/PanelContextMenu.tsx
    - src/features/panels/components/PanelContextMenu.types.ts
    - src/features/panels/components/PanelContextMenu.test.tsx
  modified:
    - src/features/panels/components/PanelGrid.tsx
    - src/features/panels/components/PanelFrame.tsx
    - src/views/DashboardView.tsx
    - src/views/MapView.tsx
    - src/stores/layout/layout.store.ts
    - src/stores/layout/layout.types.ts
  deleted:
    - src/features/panels/components/PanelToolbar.tsx
    - src/features/panels/components/PanelToolbar.types.ts

key-decisions:
  - 'onResetLayout callback prop instead of direct store call — enables skipNextSave guard'
  - 'editMode fully removed from layout store (PanelToolbar was last consumer)'
  - 'Nested ContextMenus work as expected — inner panel menu takes priority over grid menu'

issues-created: []
duration: 26min
completed: 2026-03-18
---

# Phase 14 Plan 03: Context Menu + PanelToolbar Removal Summary

**Right-click context menu on all panels and empty grid space, PanelToolbar deleted, reset layout fixes panel sizes**

## Performance

- **Duration:** 26 min
- **Tasks:** 2 auto + 1 checkpoint (with 1 deviation fix)
- **Files created:** 4
- **Files modified:** 8
- **Files deleted:** 2

## Task Commits

1. **Install shadcn context-menu + PanelContextMenu** — `435636d` (feat)
2. **Wire context menu, remove PanelToolbar** — `39a8d61` (feat)
3. **Fix reset layout preserving sizes** — `5eb5b6e` (fix) — checkpoint deviation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Reset layout didn't restore default panel sizes**

- Found during: Checkpoint verification
- Issue: react-grid-layout's onLayoutChange fired after reset, re-saving stale layout over fresh defaults
- Fix: Added skipNextSaveRef guard + moved resetLayout to onResetLayout callback prop
- Committed in: 5eb5b6e

## Next Phase Readiness

- Ready for 14-04: Hamburger position + cleanup

---

_Phase: 14-view-wiring_
_Completed: 2026-03-18_
