# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** A working, visually polished robot telemetry dashboard that connects to real ROS2 robots and looks like it belongs at a defense contractor.

## Current Position

**Current:** EPIC/workspace-refactor — T-088 god component breakup
**Status:** Wave 1 dispatching (7 parallel tickets), Wave 2 blocked
**Branch:** EPIC/workspace-refactor
**Merge path:** EPIC/workspace-refactor → overnight → main

## Completed Work

| Feature            | Key Commits          | What was built                                                                              |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------- |
| Scaffolding        | `aa6602e`            | Vite 7, React 19, TypeScript 5.9, ESLint, Prettier, shadcn, roslib smoke test               |
| Design System      | `1225783`, `7214a9e` | Midnight Operations OKLCH tokens, @theme inline, dark/light themes, Lucide React            |
| App Shell          | `dc82a8e`            | Collapsible sidebar, header with breadcrumb, statusbar, mobile drawer, dark-first theme     |
| Conventions        | `b99243f`, `51d4d40` | CLAUDE.md rules, DESIGN-SYSTEM.md, FOLDER-STRUCTURE.md, TESTING.md                          |
| Landing Page       | `371bcbd`            | CX2-inspired hero, features, problem/solution, CTA, footer                                  |
| Fleet + Robot Mgmt | `baa673f`, `5e7b056` | Connection store, RobotCard (shadcn Card + 6 subcomponents), AddRobotModal, FleetEmptyState |
| Robot Workspace    | `4539f9a`            | 3×2 grid, WorkspacePanel shell, dev views (now deleted)                                     |
| Code Quality       | `316d750`–`d007c8b`  | eslint-plugin-boundaries, jsx-a11y, jsdoc, shadcn adoption, WCAG AA                         |
| Phase 11 Panels    | `dfd9319`–`1f77d08`  | All 6 production panels (below), ROS2 types, architecture refactors, contrast fixes         |

### Phase 11 — Production Panels (this session)

| Panel         | Key Features                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| System Status | Data rows (dl/dt/dd), battery color thresholds, connection badge, red dot disconnect                 |
| Controls      | D-pad press-and-hold, velocity sliders (shadcn Slider), disabled when disconnected, keyboard support |
| IMU Attitude  | 4 variants (attitude+compass, numbers, attitude-only, 3D wireframe), VARIANT_VIEWS dictionary        |
| LiDAR         | Canvas 2D scatter plot, cartesian grid, range circles, distance-colored points, zoom +/- buttons     |
| Telemetry     | Canvas 2D time-series chart, auto-scaled axes, grid, "No data" empty state                           |
| Camera        | Empty state with camera icon, topic label. WebRTC frame capture deferred                             |

### Phase 11 — Architecture Changes

- **Explicit panel rendering** — RobotWorkspace renders each WorkspacePanel directly (no array, no map)
- **ImuPanel owns variant state** — no prop drilling, VARIANT_VIEWS dictionary in constants
- **useMinimizedPanels hook** — minimize, maximize (all others hide), restore, dynamic grid reflow
- **useControlPublisher hook** — setInterval-based 10Hz Twist publishing, shared in src/hooks/
- **WorkspacePanel simplified** — semantic article/header, no footer, minimize + maximize buttons
- **Mocks deleted** — all archived mocks and fleet dev views removed
- **Canvas theme redraw** — useThemeChange + themeVersion state forces canvas redraw on theme switch
- **Design system contrast** — border tokens bumped (dark 0.25→0.30, light 0.82→0.75), text-muted light 0.50→0.45
- **ROS2 types ported** — Vector3, Quaternion, ROSHeader, TwistMessage, ImuMessage, LaserScanMessage, OdometryMessage, BatteryStateMessage from EPIC branch
- **Shared types** — Direction, VelocityLimits in src/types/control.types.ts, ImuOrientation base interface
- **Shared utilities** — normalizeHeading, formatDegrees, formatUptime, withAlpha

## Decisions (this rebuild)

- Palette D "Midnight Operations" — OKLCH hue 260, accent hue 230
- Fonts: Exo (UI) + Roboto Mono (telemetry)
- Icons: Lucide React
- Sidebar: Collapsible toggle (200px ↔ 48px), Pilot nav item added
- Mobile: Drawer-only, no bottom tab bar
- Theme: Dark-first (ignores system preference, defaults to dark)
- shadcn-first for components (Button, Input, Badge, Card, Dialog, Select, Popover, Slider installed)
- Three-tier architecture: src/\* → Features → App (enforced by eslint-plugin-boundaries)
- Feature folders: components/ for UI, hooks/ for hooks, types/ for interfaces, constants.ts/helpers.ts at root
- Hook folder structure: bloated hooks get own folder with constants.ts, types.ts, helpers.ts
- Types in feature types/ folder, never inline or co-located with components
- ConditionalRender component replaces {condition && <X />} patterns
- Canvas 2D over Recharts for streaming data (SVG re-renders full subtree, not viable at 10-20Hz)
- Ring buffer + RAF loop architecture planned for future sensor data integration
- observable-hooks installed but deferred for sensor streams (useControlPublisher uses simple setInterval)
- Each panel handles its own connected/disconnected state internally

## Process Rules

- GSD for tracking only (this file + ROADMAP.md)
- Freeform pair programming for execution
- Research tools FIRST (ui-ux-pro-max, context7, /frontend-design) — enforced by PreToolUse hook
- Discuss design BEFORE implementing — no exceptions for "small" changes
- Google JS Style Guide for JSDoc docstrings
- Vertical feature development
- Checkpoint after every feature
- Playwright MCP for visual verification
- Never commit unless explicitly asked

## Session Continuity

Last session: 2026-04-05
Current: EPIC/workspace-refactor — panels own their ROS subscriptions, workspace becomes thin orchestrator.

### T-088 Workspace Refactor

**Architecture decision:** Panels own their ROS subscriptions (not centralized in workspace).
Each panel receives `ros` + `connected` + `topicName` and calls its own subscription hooks internally.

**Wave 1 (parallel, no blockers):** T-088a through T-088g
**Wave 2 (blocked by Wave 1):** T-088h — RobotWorkspace slim-down

**After this EPIC:** Mockups page is next.

### Open Issues

- ISS-004: Workspace grid responsive breakpoints (3 cols too cramped below 1024px)
- Hardcoded OKLCH fallbacks in canvas components (deferred)
- Angle rounding utility (formatDegrees) created but could add formatDistance
