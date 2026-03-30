# Phase 10: Polish Sweep

**Status:** In Progress
**Started:** 2026-03-30
**Branch:** EPIC/v4-rebuild

## Goal

Complete queued cleanup tasks from previous sessions. Code quality, convention enforcement, and minor UI fixes before moving to real data wiring.

## Tasks

### Completed

- [x] JSDoc format — `/** ComponentName` on first line, `@description` on second (42 files)
- [x] Ternary extraction — multi-line branches extracted to named subcomponents (4 files: Sidebar, WorkspaceGrid, FleetOverview, WorkspacePanel)
- [x] Components audit — inline types extracted (NavItemProps, ComingSoonProps), stale StatusBar TODO removed
- [x] CLAUDE.md docstring rule updated with new format + example

### Remaining

- [ ] Finalize RobotCard types (consolidate or keep granular?)
- [ ] Fleet card — move trash icon to top-right corner (needs /frontend-design)
- [ ] Landing page — add roadmap/what's next, docs, rosbridge instructions (needs /frontend-design)
- [ ] In-depth panel design for /robot/:id — design all 6 panels (needs /frontend-design)
- [x] Button + Badge a11y contrast audit — shadcn tokens were undefined; mapped all shadcn vars to design system
- [x] Header brand link — links to /fleet in AppShell, / on landing page

## Key decisions

- JSDoc format: `/** Name\n * @description verb phrase` — component name on opening line for quick scanning
- Ternary rule: branches 3+ lines get extracted; ternary itself stays (not replaced by ConditionalRender)
- Background agents for mechanical tasks (JSDoc, audits); inline for visual/design work
- Mock file ternary violations (FleetDevView) skipped — low priority

## Files changed

- 42 files: JSDoc format transformation
- `src/components/Sidebar.tsx`: chained ternary → two ConditionalRender blocks
- `src/features/workspace/components/WorkspaceGrid.tsx`: PanelGrid + AllMinimizedMessage subcomponents
- `src/features/fleet/FleetOverview.tsx`: FleetEmptyView + FleetRobotGrid subcomponents
- `src/features/workspace/components/WorkspacePanel.tsx`: TopicSelector subcomponent
- `src/types/Sidebar.types.ts`: added NavItemProps
- `src/types/ComingSoon.types.ts`: created (extracted from inline)
- `src/components/StatusBar.tsx`: removed stale TODO
- `src/components/ComingSoon.tsx`: uses ComingSoonProps from types file
- `CLAUDE.md`: docstring rule updated with example
