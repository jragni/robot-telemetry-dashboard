# Roadmap: Robot Telemetry Dashboard v4

## Overview

Twelve phases deliver a defense-contractor-grade robot telemetry dashboard from empty repo to polished product. The build order follows a strict dependency chain: foundation (scaffolding, design system, shell, routes) before data (transport, fleet, telemetry) before interaction (workspace, control, pilot, map) before integration. Every phase leaves the app in a working, demonstrable state. No "wire later" phases.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Scaffolding** - Vite 7 project with all dependencies verified, test infrastructure, and CI quality gate `[logic]`
- [ ] **Phase 2: Design System** - OKLCH design tokens, light/dark theme toggle, defense-contractor aesthetic foundation `[visual]`
- [ ] **Phase 3: App Shell** - Sidebar-driven navigation with collapsible sidebar, header, and content area `[visual]`
- [ ] **Phase 4: Router** - All route slots wired to shell with deep-link verification `[logic]`
- [ ] **Phase 5: Transport Layer** - rosbridge connection manager with reconnection, subscription registry, and connection UI `[logic]`
- [ ] **Phase 6: Fleet Overview** - Robot cards grid at `/` with status indicators and multi-robot monitoring `[visual]`
- [ ] **Phase 7: Telemetry Data Layer and Widgets** - RxJS pipelines, ring buffer, IMU/plot/LiDAR/raw-value widgets `[visual]`
- [ ] **Phase 8: Robot Workspace** - Panel grid layout at `/robot/:id` composing telemetry widgets with ISS-008 fix `[integration]`
- [ ] **Phase 9: Control Layer** - E-Stop, velocity D-pad/sliders, outbound command publishing at 10Hz `[visual]`
- [ ] **Phase 10: Pilot View** - Camera feed with HUD control overlay at `/pilot/:id` `[visual]`
- [ ] **Phase 11: Map View** - Occupancy grid rendering via Web Worker at `/map` with robot markers `[visual]`
- [ ] **Phase 12: Integration and Polish** - E2E smoke tests, responsive mobile layout, visual polish pass `[integration]`

## Phase Details

### Phase 1: Scaffolding
**Type**: `logic`
**Goal**: A verified build foundation where every dependency works with React 19 and Vite 7
**Depends on**: Nothing (first phase)
**Requirements**: (none -- infrastructure foundation)
**Research flag**: Skip research-phase
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts a Vite 7 dev server that renders a React 19 component in the browser
  2. `npm run build` produces a production bundle with zero errors and zero warnings
  3. `npm test -- --run` executes at least one Vitest test that passes
  4. `npx playwright test` executes at least one Playwright test that captures a screenshot
  5. roslib 2.0.1 imports without CJS/ESM errors, Recharts renders a chart (react-is override working), react-grid-layout renders a grid -- all verified by smoke tests
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Clean slate + Vite 7 project + deps + ESLint + Prettier + shadcn
- [x] 01-02-PLAN.md — Test infrastructure + roslib smoke + visual gate + quality gate

### Phase 2: Design System
**Type**: `visual`
**Goal**: Every component built from this point forward uses defense-contractor design tokens -- no hardcoded colors, no AI slop
**Depends on**: Phase 1
**Requirements**: DSGN-01, DSGN-02
**Research flag**: Skip research-phase
**Success Criteria** (what must be TRUE):
  1. A theme toggle switches the entire app between light and dark themes, and the preference persists across browser sessions via localStorage
  2. System color scheme preference is detected on first visit (no toggle interaction needed)
  3. The `data-theme` attribute on `<html>` changes when theme toggles, and all OKLCH token values update accordingly
  4. A sample component (e.g., DataCard) renders with the defense-contractor aesthetic: dark charcoal backgrounds, electric blue accents, grid panel borders, no gradients, no rounded corners beyond `rounded-sm`
**Plans**: 2 plans

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: App Shell
**Type**: `visual`
**Goal**: Users navigate a sidebar-driven hierarchy (Fleet > Robot > Detail) with a collapsible sidebar and responsive content area
**Depends on**: Phase 2
**Requirements**: SHELL-01, SHELL-02
**Research flag**: Skip research-phase
**Success Criteria** (what must be TRUE):
  1. A collapsible sidebar shows Fleet > Robot > Detail navigation hierarchy that updates based on current route context
  2. Sidebar collapses/expands and the main content area resizes accordingly without layout thrashing
  3. Header area displays contextual information (app name, current view breadcrumb)
  4. The shell renders correctly in both light and dark themes using Phase 2 design tokens
**Plans**: 2 plans

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Router
**Type**: `logic`
**Goal**: Every route in the app is reachable via deep link and renders inside the shell -- no "wire later" risk
**Depends on**: Phase 3
**Requirements**: (none -- routes are infrastructure; VIEW requirements are fulfilled when views render content in later phases)
**Research flag**: Skip research-phase
**Success Criteria** (what must be TRUE):
  1. Navigating to `/` renders a Fleet Overview placeholder inside the shell
  2. Navigating to `/robot/:id` renders a Robot Workspace placeholder inside the shell
  3. Navigating to `/pilot/:id` renders a Pilot View placeholder inside the shell
  4. Navigating to `/map` renders a Map View placeholder inside the shell
  5. Playwright tests verify all four routes are reachable via deep link (direct URL entry, not just click navigation)
**Plans**: 2 plans

Plans:
- [ ] 04-01: TBD

### Phase 5: Transport Layer
**Type**: `logic`
**Goal**: The app connects to rosbridge, recovers from disconnections, and re-subscribes topics automatically -- the data pipeline foundation
**Depends on**: Phase 4
**Requirements**: CONN-01, CONN-02, CONN-03
**Research flag**: Needs research-phase (reconnection + subscription registry behavior with roslib 2.0 / rosbridge 2.x)
**Success Criteria** (what must be TRUE):
  1. User can enter a rosbridge URL in a connection config panel, and the URL persists in localStorage across sessions
  2. A connection status indicator shows real-time state (connected/disconnected/reconnecting) with latency measurement
  3. When the WebSocket connection drops, the app automatically reconnects with exponential backoff and re-subscribes all previously active topics without user intervention
  4. Connection state is tracked per-robot in Zustand, and multiple simultaneous connections are supported
**Plans**: 2 plans

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Fleet Overview
**Type**: `visual`
**Goal**: Operators see all connected robots at a glance and can select one to drill into
**Depends on**: Phase 5
**Requirements**: FLEET-01, FLEET-02, VIEW-01
**Research flag**: Skip research-phase
**Success Criteria** (what must be TRUE):
  1. The Fleet Overview at `/` displays robot cards in a grid, each showing robot name, connection status indicator, and battery level
  2. Multiple robots (2-5) appear simultaneously with independent status indicators
  3. Clicking a robot card navigates to that robot's workspace (`/robot/:id`)
  4. An empty state is displayed when no robots are connected (not a blank screen)
**Plans**: 2 plans

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Telemetry Data Layer and Widgets
**Type**: `visual`
**Goal**: Live telemetry data streams from ROS topics into the UI as throttled, memory-safe visualizations
**Depends on**: Phase 5
**Requirements**: TELE-01, TELE-02, TELE-03, TELE-04, CONN-04
**Research flag**: Needs research-phase (Recharts streaming performance at 10Hz, ring buffer tuning)
**Success Criteria** (what must be TRUE):
  1. IMU orientation widget displays live roll, pitch, yaw values updating in real-time from a ROS topic
  2. Time-series plot renders streaming data with a configurable rolling window (e.g., 30s) that appends new points without memory growth
  3. LiDAR scan renders as a 2D radar-style polar plot on Canvas from LaserScan topic data
  4. Raw topic values display as formatted key/value pairs for any subscribed topic
  5. Available ROS topics are auto-discovered via rosbridge introspection and presented for subscription
**Plans**: 2 plans

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD
- [ ] 07-03: TBD

### Phase 8: Robot Workspace
**Type**: `integration`
**Goal**: A robot's telemetry widgets and controls are composed into a fixed-layout panel grid that fills the workspace without layout bugs
**Depends on**: Phase 7
**Requirements**: VIEW-02
**Research flag**: Skip research-phase (ISS-008 fix documented)
**Success Criteria** (what must be TRUE):
  1. Navigating to `/robot/:id` renders a panel grid with telemetry widgets (IMU, plots, raw values) populated with live data
  2. The panel grid uses `window.innerHeight`-anchored rowHeight on desktop (ISS-008 fix) and static rowHeight on smaller breakpoints
  3. Panel-level error boundaries prevent a single widget crash from taking down the entire workspace
  4. The workspace renders correctly in both light and dark themes
**Plans**: 2 plans

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: Control Layer
**Type**: `visual`
**Goal**: Operators can safely control robot movement and immediately halt operation from any view
**Depends on**: Phase 7
**Requirements**: CTRL-01, CTRL-02
**Research flag**: Skip research-phase
**Success Criteria** (what must be TRUE):
  1. E-Stop button is visible and reachable within one click from every view in the app (fleet, workspace, pilot, map)
  2. Pressing E-Stop immediately publishes a zero-velocity command and visually indicates active stop state
  3. D-pad and velocity sliders publish geometry_msgs/Twist to /cmd_vel at a rate-limited 10Hz
  4. Velocity values are clamped to safe ranges and displayed numerically to the operator
**Plans**: 2 plans

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: Pilot View
**Type**: `visual`
**Goal**: Operators can drive a robot with a camera-forward perspective and HUD controls overlaid on the video feed
**Depends on**: Phase 9
**Requirements**: CTRL-03, VIEW-03
**Research flag**: Needs research-phase (CompressedImage decode performance, frame rate management)
**Success Criteria** (what must be TRUE):
  1. Camera feed renders from a CompressedImage ROS topic with frame rate capped at 30fps
  2. Pilot view at `/pilot/:id` displays camera as the primary viewport with translucent HUD control overlay (D-pad, velocity, E-Stop)
  3. Frame drops are handled gracefully (no frozen frames, no memory accumulation from decode queue)
  4. An immersive fullscreen toggle hides the sidebar and header for maximum viewport
**Plans**: 2 plans

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD

### Phase 11: Map View
**Type**: `visual`
**Goal**: Operators view a 2D occupancy grid map with robot position markers, rendered efficiently via Web Worker
**Depends on**: Phase 5
**Requirements**: VIEW-04
**Research flag**: Needs research-phase (OffscreenCanvas support, Web Worker + Transferable patterns)
**Success Criteria** (what must be TRUE):
  1. Map view at `/map` renders an OccupancyGrid as a 2D grayscale image via Canvas2D
  2. Grid data is fetched on-demand (subscribe, receive, unsubscribe) -- not a continuous subscription
  3. A re-center button resets the viewport to the robot's current position
  4. Large grids (1000x1000+) render without blocking the main thread (Web Worker processing)
**Plans**: 2 plans

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

### Phase 12: Integration and Polish
**Type**: `integration`
**Goal**: Every route works end-to-end, the app is responsive on mobile, and the visual quality passes defense-contractor standards
**Depends on**: Phase 8, Phase 9, Phase 10, Phase 11
**Requirements**: DSGN-03
**Research flag**: Skip research-phase
**Success Criteria** (what must be TRUE):
  1. E2E Playwright tests navigate every route and verify visible content (not blank screens, not "Coming soon" placeholders)
  2. Mobile layout (375px width) renders a monitoring-only view with bottom tab bar and swipeable robot cards -- no full control interface
  3. WebSocket reconnection, theme persistence, router deep links, canvas cleanup, and E-Stop reachability all pass the "Looks Done But Isn't" checklist
  4. Visual screenshot scoring passes 7+ on AI Slop, Defense Aesthetic, and Polish dimensions in both light and dark themes
  5. Light theme is intentionally designed (not just an inverted dark theme) with readable contrast ratios
**Plans**: 2 plans

Plans:
- [ ] 12-01: TBD
- [ ] 12-02: TBD
- [ ] 12-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 > 4 > 5 > 6 > 7 > 8 > 9 > 10 > 11 > 12

Note: Phases 6 and 7 can execute in parallel (both depend on Phase 5). Phases 9 and 11 can execute in parallel (9 depends on 7, 11 depends on 5).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffolding | 0/2 | Not started | - |
| 2. Design System | 0/2 | Not started | - |
| 3. App Shell | 0/2 | Not started | - |
| 4. Router | 0/1 | Not started | - |
| 5. Transport Layer | 0/2 | Not started | - |
| 6. Fleet Overview | 0/2 | Not started | - |
| 7. Telemetry Widgets | 0/3 | Not started | - |
| 8. Robot Workspace | 0/2 | Not started | - |
| 9. Control Layer | 0/2 | Not started | - |
| 10. Pilot View | 0/2 | Not started | - |
| 11. Map View | 0/2 | Not started | - |
| 12. Integration | 0/3 | Not started | - |

## Backlog

### Phase 999.1: Product Landing Page (BACKLOG)

**Goal:** Startup-style landing page — describes the problem (robot telemetry monitoring is fragmented), other solutions, what this product is, who it's for (robotics engineers, defense contractors), why it's needed, and how it solves the problem. Think product landing page, not docs. Good candidate for applying the design system to a real page.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)
