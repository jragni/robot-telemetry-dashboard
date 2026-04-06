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
- T-068: sensorVector3Schema nullable axes — PR #52
- T-071: Landing page unit tests — PR #56
- T-078: PilotCompass folder structure — PR #65
- T-079: PilotHud types co-location — PR #66
- T-080: PilotLidarMinimap folder structure — PR #67
- T-081: Extract PilotNotFound from PilotView — PR #53
- T-082: RobotWorkspaceMobile restructure — PR #64
- T-083: TelemetryPanel draw helpers — PR #63
- T-084: ConnectionManager class refactor — PR #54
- T-086: Reconnect toast off-by-one — PR #61
- T-090: Disable text selection on mobile pilot — PR #62

## In Progress

(none)

## Backlog

### Refactors

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

### Bugs

#### T-091: Mobile LiDAR minimap visual alignment with workspace
- Severity: LOW
- Visual work — requires `/visual-pipeline` (discuss/research/approve)
- Scope: src/features/pilot/components/PilotLidarMinimap.tsx, pilot/constants.ts
- Problem: mobile pilot LiDAR minimap uses different color scheme than the workspace LidarPanel, and point dots are too large for small viewports making the scan hard to read.
- Fix: match point colors and background to workspace LidarPanel token scheme. Reduce point radius for mobile (use smaller pixel size for minimap context). May need separate mobile constants or responsive size logic.
- Acceptance: mobile minimap visually consistent with workspace LidarPanel colors, dots smaller and scan readable on 375px viewport, build passes.
- Branch: fix/t-091/mobile-lidar-visual

### Portfolio Polish (anti-slop evidence)

#### T-092: README overhaul — screenshot, design decisions, known limitations
- Severity: HIGH
- Scope: README.md
- Add dashboard screenshot/GIF with live data to README header
- Add "Design Decisions" section: Canvas over SVG for LiDAR (SVG re-renders full subtree at 10-20Hz), Zustand over Redux/Context, class singleton for ConnectionManager, rosbridge + RxJS data layer, OKLCH color system
- Add "Known Limitations" section: WebRTC latency constraints, rosbridge JSON bandwidth inflation, single-robot pilot mode, no multi-echo LiDAR support
- Add deployed site link in README header
- Acceptance: README has visual proof, technical depth, and honest limitations. No generic "getting started" filler.
- Branch: docs/t-092/readme-overhaul

#### T-093: Clean dead code, TODO comments, and commented-out blocks
- Severity: HIGH
- Scope: all src/ files
- Audit for: `// TODO:` comments without context, commented-out code blocks, unused imports, dead functions, placeholder text ("Dashboard screenshot — pending")
- Remove or resolve each one. If a TODO is real, convert to a ticket and remove the comment.
- Acceptance: zero `// TODO` comments in src/ (except intentional documented ones), zero commented-out code blocks, build passes
- Branch: chore/t-093/dead-code-sweep

#### T-094: GitHub repo metadata
- Severity: MEDIUM
- Scope: GitHub settings (not code)
- Add repo description, website URL (deployed site), and topics: ros2, webrtc, telemetry, react, typescript, robotics, zustand, tailwindcss
- Can be done via `gh repo edit` CLI
- Branch: n/a (GitHub settings only)

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
