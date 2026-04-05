# Issues — General Housekeeping

Consolidated from 5 parallel audits on 2026-04-03. Restructured 2026-04-05 into status sections.

---

## Done

- T-025: Fix shared→feature import boundary violations — PR #24
- T-026: Add cancel() to rafThrottle and clean up on unmount — PR #27
- T-027: Handle ConnectionManager.connect rejection — PR #25
- T-028: Publish ZERO_TWIST on useControlPublisher unmount — PR #26
- T-029: Migrate workspace canvas components to useCanvasColors — PR #28
- T-030: Remove unused production dependencies — PR #29
- T-031: Route-level code splitting — PR #30
- T-032: Extract StatusDot and GyroInline from PilotHudMobile — PR #31
- T-033: Fix LidarPanel Math.min stack overflow risk — PR #32
- T-034: Fix telemetry ring buffer copy — PR #33
- T-035: Add useMemo to PilotView render-path allocations — PR #34
- T-036: Validate RTCSdpType with z.enum — PR #35
- T-037: Extract duplicate constants to shared — PR #36
- T-038: Delete barrel file and re-export — PR #37
- T-039: Extract inline types to types files — PR #38
- T-040: Add post-unmount guards to useRosGraph and useRosTopics — PR #39
- T-041: Test ConnectionManager — PR #40
- T-042: Test pure utility functions — PR #41
- T-043: Test fleet helpers and schemas — PR #42
- T-044: Expand useConnectionStore tests — PR #43
- T-045: Test calculateBackoffDelay and buildTwist — PR #44
- T-046: Test subscription hook behavior — PR #45
- T-047: Test useMinimizedPanels — PR #46
- T-048: Test SignalingClient — PR #47
- T-064: Full convention sweep — PR #49
- T-066: Connection UX — PR #50
- T-067: Misc fixes — PR #51
- T-068: sensorVector3Schema nullable axes — 49de4d5 (pending PR)
- T-081: Extract PilotNotFound from PilotView — 4249ebc (pending PR)
- T-084: ConnectionManager class refactor — a4dadc5 (pending PR)
- T-086: Reconnect toast off-by-one — fce1c81 (pending PR)
- T-071: Landing page unit tests — c296d63 (pending PR)

## In Progress

(none)

## Backlog

### Folder Restructure (serialize: T-078 → T-079 → T-080)

#### T-078: PilotCompass folder structure
- Severity: MEDIUM
- Scope: src/features/pilot/components/PilotCompass/
- Co-locate types, constants, helpers per FOLDER-STRUCTURE.md. Move compass constants from pilot/constants.ts.
- Branch: refactor/t-078/pilot-compass-structure

#### T-079: PilotHud folder structure (types co-location only — barrel imports handled by T-077)
- Severity: MEDIUM
- Scope: src/features/pilot/components/PilotHud/
- Move PilotHudProps/PilotHudMobileProps to PilotHud.types.ts from PilotView.types.ts.
- Branch: refactor/t-079/pilot-hud-structure

#### T-080: PilotLidarMinimap folder structure
- Severity: MEDIUM
- Scope: src/features/pilot/components/PilotLidarMinimap.tsx (210 lines)
- Create folder with index.ts, types.ts, constants.ts, helpers.ts. Move minimap constants from pilot/constants.ts.
- Branch: refactor/t-080/pilot-lidar-minimap-structure

#### T-088: RobotWorkspace god component refactor
- Severity: HIGH
- Scope: src/features/workspace/RobotWorkspace.tsx (305 lines, 14 hooks, 7 concerns)
- Problem: single component owns all subscriptions, topic auto-selection, grid layout, mobile routing, 6 panel blocks, and minimized bar. Too many responsibilities.
- Fix:
  - Extract `useWorkspaceSubscriptions` hook — consolidates the 8 data hooks (battery, uptime, lidar, imu, telemetry, webrtc, controls, rosGraph) into one return object
  - Extract `useAutoTopicSelection` hook — moves the auto-select effect + ref + filteredTopics memo
  - Extract `WorkspaceNotFound` component — same pattern as PilotNotFound (T-081)
  - Extract `WorkspaceGrid` component — receives panel data, renders the 6 WorkspacePanel blocks and grid layout
  - Extract `MinimizedPanelBar` component — the restore nav at the bottom
  - RobotWorkspace becomes an orchestrator: get robot, call hooks, route mobile vs desktop, render WorkspaceGrid
  - Target: RobotWorkspace under 80 lines
- Dependencies: run after T-082 (RobotWorkspaceMobile restructure) to avoid file conflicts
- Acceptance: RobotWorkspace under 80 lines, each extracted piece tested, build passes
- Branch: refactor/t-088/workspace-god-component

#### T-082: RobotWorkspaceMobile convention violations
- Severity: MEDIUM
- Scope: src/features/workspace/components/RobotWorkspaceMobile.tsx
- Create folder, extract MobileTabBar and MobilePanelHeader, alphabetize props, remove JSX comments.
- Branch: refactor/t-082/workspace-mobile-structure

#### T-083: TelemetryPanel draw logic helpers
- Severity: MEDIUM
- Scope: src/features/workspace/components/TelemetryPanel.tsx
- Create folder, extract 5 draw helpers, orchestrator pattern. draw() under 30 lines.
- Branch: refactor/t-083/telemetry-helpers

### Cross-cutting Sweeps (run after folder restructures)

#### T-077: Fix barrel file imports
- Severity: MEDIUM
- Scope: ~20 imports across src/ that bypass barrel index.ts files.
- Also absorbs T-079 barrel import fixes.
- Branch: refactor/t-077/barrel-imports

#### T-074: Lint error sweep
- Severity: MEDIUM
- Scope: 23 lint errors across src/. Run after T-084 (rewrites ConnectionManager.test.ts).
- Branch: fix/t-074/lint-sweep

#### T-087: Rename feature entry components to Page convention
- Severity: LOW
- Scope: 3 features + ~23 consumer files
- Rename main feature components to use Page suffix:
  - `src/features/fleet/FleetOverview.tsx` → `FleetPage.tsx` (component: FleetOverview → FleetPage)
  - `src/features/pilot/PilotView.tsx` → `PilotPage.tsx` (component: PilotView → PilotPage)
  - `src/features/workspace/RobotWorkspace.tsx` → `WorkspacePage.tsx` (component: RobotWorkspace → WorkspacePage)
- LandingPage.tsx and MockupsPage.tsx already follow the convention
- Update all imports across src/ (~23 files reference these names)
- Update App.tsx route lazy imports
- Update route-code-splitting.test.ts
- Acceptance: all feature entry components named *Page, all imports updated, build + tests pass
- Branch: refactor/t-087/page-naming-convention

### Visual (requires /visual-pipeline)

#### T-052: MIL-STD-1472H status indicator icons
- Add lucide-react icons to all status indicators (ConnectionRow, SystemStatusPanel, ControlsPanel, BatteryRow).
- Every status indicator must have color + icon + text.

#### T-085: Add body-frame axes to WireframeView 3D visualization
- Severity: LOW
- Scope: WireframeView.tsx, workspace/constants.ts
- Draw XYZ body-frame axis lines from origin, color-coded (red/green/blue), extending beyond cube edges.
- Branch: feat/t-085/wireframe-body-axes

#### T-065: Responsive + visual polish (split into 3 sub-tickets)
- T-065a: Desktop resize + panel overflow/clipping
- T-065b: Mobile layout trigger + camera tab blank
- T-065c: Light mode contrast audit

#### T-076: Extract PilotModeCta from ControlsPanel
- Severity: LOW
- Extract Pilot Mode CTA block into PilotModeCta.tsx. Run after T-052 (both touch ControlsPanel).
- Branch: refactor/t-076/pilot-mode-cta

### Testing (run after all restructures)

#### T-070: Fleet feature testing (unit + E2E)
- Severity: MEDIUM
- Scope: src/features/fleet/ — components, helpers, schemas, connection flow.
- Branch: test/t-070/fleet-testing

#### T-072: Pilot feature testing (unit + E2E)
- Severity: MEDIUM
- Scope: src/features/pilot/ — PilotView, PilotHud, PilotCompass, PilotStatusBar, fullscreen, controls.
- Branch: test/t-072/pilot-testing

#### T-073: Workspace feature testing (unit + E2E)
- Severity: MEDIUM
- Scope: src/features/workspace/ — RobotWorkspace, 6 panels, minimize/maximize, mobile workspace.
- Branch: test/t-073/workspace-testing

### Documentation (run last — all paths finalized)

#### T-069: JSDoc sweep
- Severity: LOW
- Scope: All exported functions in .ts and .tsx files across src/.
- Branch: chore/t-069/jsdoc-sweep

### Deferred

#### T-075: Restructure shared hooks into own folders
- Severity: LOW
- Deferred: most hooks have only 2 files, high-churn/low-value. Revisit when hooks grow.
- Branch: refactor/t-075/hooks-restructure
