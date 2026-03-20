# Roadmap: Robot Telemetry Dashboard v3

## Overview

A 12-phase, spec-driven TDD rebuild of the Robot Telemetry Dashboard. Foundation first (scaffold, design system, shell), then features one at a time following SPEC > Research > TDD (RED) > Build (GREEN) > Sweep. Integration verification in Phase 12 prevents the v2 overnight-build gap.

## Phases

- [x] **Phase 1** — Foundation & Scaffold
- [ ] **Phase 2** — Design System (UI/UX Pro Max)
- [ ] **Phase 3** — App Shell & Routing
- [x] **Phase 4** — Feature: ROS Connection
- [ ] **Phase 5** — Feature: Telemetry Widgets
- [ ] **Phase 6** — Feature: Panel System
- [ ] **Phase 7** — Feature: Robot Control
- [ ] **Phase 8** — Feature: WebRTC Video
- [ ] **Phase 9** — Feature: FPOV Pilot Mode
- [ ] **Phase 10** — Feature: Multi-Robot Fleet
- [ ] **Phase 11** — Feature: SLAM Map
- [ ] **Phase 12** — Integration & Polish

---

## Phase Details

### Phase 1: Foundation & Scaffold

**Goal:** Clean project setup with all tooling configured and passing quality gate from commit zero.

**Depends on:** Nothing (starting point)

**Tasks:**

- [ ] Initialize Vite 7 + React 19 + TypeScript 5.9 project
- [ ] Install core dependencies: Zustand, RxJS, roslib
- [ ] Install dev dependencies: Vitest, Playwright, ESLint, Prettier
- [ ] Configure ESLint with v3 conventions (no barrel files, strict types, one-component-per-file)
- [ ] Configure Prettier for consistent formatting
- [ ] Configure Vitest (unit + component testing)
- [ ] Configure Playwright (E2E, responsive viewports)
- [ ] Configure `vite.config.ts` with `optimizeDeps.include: ['roslib']` (ISS-008 prevention)
- [ ] Scaffold file structure: `src/{shared,features,services,pages,config}/`
- [ ] Scaffold feature directories: `dashboard/`, `fleet/`, `pilot/`, `map/`, `telemetry/`, `connection/`
- [ ] Create shared directory structure: `components/`, `hooks/`, `stores/`, `types/`, `utils/`
- [ ] Create services directory: `ros/transport/`, `ros/types/`
- [ ] Add `tsconfig.json` with strict mode, path aliases (`@shared/`, `@features/`, `@services/`, `@pages/`, `@config/`)
- [ ] Verify quality gate passes: `npm run lint && tsc --noEmit && npm test -- --run && npm run build`

**Research:**

- context7 MCP: Vite 7 config options, React 19 changes
- context7 MCP: Vitest + Playwright current setup patterns

**Testing:**

- Quality gate green on empty scaffold
- `npm run build` produces valid output
- All path aliases resolve correctly

**Exit criteria:** Quality gate passes, file structure matches PROJECT.md scaffold, zero warnings.

---

### Phase 2: Design System (UI/UX Pro Max)

**Goal:** Establish the visual language — color tokens, typography, spacing, and core primitives — using design intelligence tooling.

**Depends on:** Phase 1

**Tasks:**

- [ ] Use UI/UX Pro Max skill to generate design system specification
- [ ] Define color tokens (dark charcoal base, electric blue accent, defense-contractor palette)
- [ ] Define typography scale (font family, sizes, weights, line heights)
- [ ] Define spacing scale (4px base unit grid)
- [ ] Install and configure shadcn/ui with custom theme
- [ ] Use 21st.dev Magic MCP for core primitive generation
- [ ] Build core primitives: Button, Card, Input, Select, Badge, Tooltip
- [ ] Build layout primitives: Panel, Grid, Stack, Divider
- [ ] Dark theme as default (no light mode toggle for v3)
- [ ] Create `src/config/theme.ts` with all tokens exported
- [ ] Document design system in `.planning/knowledge/decisions/ADR-003-design-system.md`

**Research:**

- UI/UX Pro Max: Defense-contractor aesthetic patterns, dark theme accessibility
- 21st.dev Magic: Available shadcn/ui components, theming approach
- context7 MCP: shadcn/ui theming documentation

**Testing:**

- Storybook-style visual verification (Playwright screenshots of each primitive)
- All primitives render correctly at all 3 breakpoints
- Color contrast meets WCAG AA for dark theme
- Quality gate passes

**Exit criteria:** All core primitives built, themed, and screenshot-verified. Design tokens documented.

---

### Phase 3: App Shell & Routing

**Goal:** Build the persistent layout shell (header, sidebar, main content area) with route navigation and responsive behavior.

**Depends on:** Phase 2

**Tasks:**

- [ ] Create DashboardShell layout component (header + sidebar + main content)
- [ ] Install and configure React Router (v7)
- [ ] Define routes: `/dashboard`, `/fleet`, `/map`, `/pilot/:robotId`
- [ ] Build Header component (logo, nav links, connection status indicator)
- [ ] Build Sidebar component (connections list, collapsible)
- [ ] Build responsive shell behavior:
  - Desktop (>=1200px): Header nav + collapsible sidebar + main content
  - Tablet (768-1199px): Header nav + hidden sidebar (toggle) + main content
  - Mobile (<768px): Bottom tab bar + full-width content + kebab menu
- [ ] Build BottomTabBar component for mobile
- [ ] Create page components (stubs): DashboardPage, FleetPage, MapPage, PilotPage
- [ ] Implement route transitions
- [ ] Build Show component (`<Show when={condition}>`) for conditional rendering

**Research:**

- UI/UX Pro Max: Mobile bottom tab bar patterns, sidebar collapse behavior
- 21st.dev Magic: Navigation components, sidebar components
- context7 MCP: React Router v7 setup

**Testing:**

- Playwright E2E: Navigation between all routes at all 3 viewports
- Playwright E2E: Sidebar collapse/expand on desktop, hidden on mobile
- Playwright E2E: Bottom tab bar visible only on mobile
- Unit: Show component conditional rendering
- Quality gate passes

**Exit criteria:** Shell renders at all breakpoints, all routes navigable, responsive behavior verified via Playwright.

---

### Phase 4: Feature — ROS Connection

**Goal:** Establish reliable ROS2 communication with auto-reconnect, topic subscription/publishing, and connection state management.

**Depends on:** Phase 3

**Workflow:** SPEC > Research > TDD (RED) > Build (GREEN) > Sweep

**Tasks:**

- [ ] Write `.planning/knowledge/specs/SPEC-ros-connection.md`
- [ ] Build RosTransport class (WebSocket wrapper around roslib.Ros)
- [ ] Implement auto-reconnect with exponential backoff
- [ ] Build TopicSubscriber RxJS wrapper (roslib.Topic -> Observable)
- [ ] Build TopicPublisher RxJS wrapper (Observable -> roslib.Topic)
- [ ] Build connection Zustand store (`useConnectionStore`)
- [ ] Build ConnectionManager UI component (sidebar integration)
- [ ] Handle connection lifecycle: connecting, connected, disconnecting, disconnected, error
- [ ] Configure `optimizeDeps.include: ['roslib']` verification test

**Research:**

- context7 MCP: roslib API, topic subscription patterns
- context7 MCP: RxJS Observable creation from event emitters

**Testing:**

- Unit: RosTransport connection lifecycle (connect, disconnect, error states)
- Unit: Auto-reconnect with exponential backoff timing
- Unit: TopicSubscriber creates Observable from roslib.Topic
- Unit: TopicPublisher sends messages to roslib.Topic
- Unit: Connection store state transitions
- Unit: roslib CommonJS bundling works (import test)
- Quality gate passes

**Exit criteria:** SPEC written, all tests green, connection lifecycle verified, auto-reconnect tested.

---

### Phase 5: Feature — Telemetry Widgets

**Goal:** Build data visualization widgets that auto-detect ROS2 message types and render appropriate visualizations.

**Depends on:** Phase 4

**Workflow:** SPEC > Research > TDD (RED) > Build (GREEN) > Sweep

**Tasks:**

- [ ] Write `.planning/knowledge/specs/SPEC-telemetry-widgets.md`
- [ ] Build TopicList component (auto-discover available topics + message types)
- [ ] Build IMUDisplay component (orientation quaternion visualization, acceleration vectors)
- [ ] Build LiDARView component (2D Canvas point cloud rendering)
- [ ] Build DataPlot component (time series line chart, auto-detect numeric fields)
- [ ] Build message type detection utility (parse ROS2 message definitions)
- [ ] Build widget registry (map message type -> appropriate widget)
- [ ] Implement data buffering for time series (ring buffer, configurable window)

**Research:**

- context7 MCP: Canvas 2D API for LiDAR point rendering
- context7 MCP: ROS2 standard message types (sensor_msgs, geometry_msgs)
- 21st.dev Magic: Chart/data visualization components

**Testing:**

- Unit: Message type parser correctly identifies field types
- Unit: Widget registry maps types to correct components
- Unit: Ring buffer maintains correct window size
- Unit: IMU quaternion to Euler conversion
- Unit: LiDAR polar to Cartesian coordinate conversion
- Unit: DataPlot renders time series from buffered data
- Unit: TopicList discovers and displays available topics
- Quality gate passes

**Exit criteria:** SPEC written, all widgets render with mock data, auto-detection works, Canvas rendering verified.

---

### Phase 6: Feature — Panel System

**Goal:** Drag-and-drop grid layout with panel persistence, context menu actions, and responsive transitions.

**Depends on:** Phase 5

**Workflow:** SPEC > Research > TDD (RED) > Build (GREEN) > Sweep

**Tasks:**

- [ ] Write `.planning/knowledge/specs/SPEC-panel-system.md`
- [ ] Install and configure react-grid-layout
- [ ] Build PanelGrid component (react-grid-layout wrapper)
- [ ] Build Panel component (wrapper with context menu trigger)
- [ ] Build panel registry (available panels, default layouts per view)
- [ ] Implement layout persistence (localStorage, per-view)
- [ ] Implement `skipNextSaveRef` guard for onLayoutChange race condition (ISS-008 prevention)
- [ ] Implement dynamic rowHeight: `window.innerHeight` for lg, static 60px for md/sm (ISS-008 prevention)
- [ ] Build context menu (right-click: remove panel, add panel, reset layout, resize)
- [ ] Build mobile carousel using embla-carousel/shadcn (replaces grid on <768px)
- [ ] Implement responsive layout transitions (grid -> carousel at breakpoint)

**Research:**

- context7 MCP: react-grid-layout API, responsive breakpoints
- context7 MCP: embla-carousel integration with shadcn/ui
- UI/UX Pro Max: Context menu UX patterns, mobile carousel behavior

**Testing:**

- Unit: Panel registry returns correct defaults per view
- Unit: Layout persistence saves/loads from localStorage
- Unit: `skipNextSaveRef` guard prevents race condition on reset
- Unit: Dynamic rowHeight uses correct source per breakpoint
- Unit: Context menu actions dispatch correctly
- Playwright E2E: Drag-and-drop panel repositioning
- Playwright E2E: Responsive grid -> carousel transition
- Quality gate passes

**Exit criteria:** SPEC written, panels draggable, layouts persist, context menu works, ISS-008 prevented, mobile carousel renders.

---

### Phase 7: Feature — Robot Control

**Goal:** Build control interfaces for teleoperation — button pad, velocity sliders, Twist message construction, and emergency stop.

**Depends on:** Phase 4

**Workflow:** SPEC > Research > TDD (RED) > Build (GREEN) > Sweep

**Tasks:**

- [ ] Write `.planning/knowledge/specs/SPEC-robot-control.md`
- [ ] Build ControlPad component (directional buttons: forward, back, left, right, stop)
- [ ] Build VelocitySliders component (linear.x, angular.z with configurable range)
- [ ] Build TopicSelector component (choose cmd_vel topic for publishing)
- [ ] Build Twist message constructor (geometry_msgs/Twist from velocity inputs)
- [ ] Build EStop component (prominent emergency stop button, publishes zero velocity)
- [ ] Build EStop safety behavior (auto-trigger on connection loss)
- [ ] Integrate control components with TopicPublisher from Phase 4

**Research:**

- context7 MCP: geometry_msgs/Twist message format
- UI/UX Pro Max: Emergency stop button patterns, control accessibility

**Testing:**

- Unit: Twist message constructed correctly from velocity inputs
- Unit: ControlPad maps button presses to correct velocity vectors
- Unit: VelocitySliders produce correct linear/angular values
- Unit: EStop publishes zero-velocity Twist on activation
- Unit: EStop auto-triggers on connection state change to disconnected
- Unit: TopicSelector filters to geometry_msgs/Twist compatible topics
- Quality gate passes

**Exit criteria:** SPEC written, control inputs produce correct Twist messages, E-stop verified, connection-loss safety tested.

---

### Phase 8: Feature — WebRTC Video

**Goal:** Live video feed from robot cameras via WebRTC with reconnection handling.

**Depends on:** Phase 3

**Workflow:** SPEC > Research > TDD (RED) > Build (GREEN) > Sweep

**Tasks:**

- [ ] Write `.planning/knowledge/specs/SPEC-webrtc-video.md`
- [ ] Build SignalingClient (WebSocket-based SDP/ICE exchange)
- [ ] Build WebRTCTransport class (RTCPeerConnection wrapper with reconnection)
- [ ] Implement generation counter for stale connection cleanup
- [ ] Build VideoFeed component (renders MediaStream to `<video>` element)
- [ ] Build VideoControls component (fullscreen toggle, stream quality indicator)
- [ ] Handle ICE candidate gathering and trickle ICE
- [ ] Implement connection quality monitoring (RTCStatsReport)

**Research:**

- context7 MCP: WebRTC API, RTCPeerConnection lifecycle
- Research agent: ROS2 WebRTC bridge implementations (webrtc_ros, ros2-web-bridge)

**Testing:**

- Unit: SignalingClient sends/receives SDP offers and answers
- Unit: WebRTCTransport lifecycle (create, connect, disconnect, reconnect)
- Unit: Generation counter prevents stale connection callbacks
- Unit: VideoFeed attaches MediaStream to video element
- Unit: Connection quality metrics parsed from RTCStatsReport
- Quality gate passes

**Exit criteria:** SPEC written, signaling client tested, transport reconnection verified, video renders from mock stream.

---

### Phase 9: Feature — FPOV Pilot Mode

**Goal:** First-person operator view combining video feed, LiDAR overlay, and control inputs in a dedicated pilot station layout.

**Depends on:** Phase 5, Phase 7, Phase 8

**Workflow:** SPEC > Research > TDD (RED) > Build (GREEN) > Sweep

**Tasks:**

- [ ] Write `.planning/knowledge/specs/SPEC-pilot-mode.md`
- [ ] Build PilotStation layout (split view: video primary + LiDAR secondary + controls)
- [ ] Build HUDOverlay component (connection status, velocity readout, battery level)
- [ ] Build PilotControls component (integrated control pad + velocity display)
- [ ] Build mobile pilot layout (stacked: video top, controls bottom, swipe for LiDAR)
- [ ] Integrate VideoFeed, LiDARView, and ControlPad into pilot station
- [ ] Implement pilot mode route (`/pilot/:robotId`)

**Research:**

- UI/UX Pro Max: HUD overlay patterns, pilot station layouts, gaming UI patterns
- 21st.dev Magic: Overlay components, split-view layouts

**Testing:**

- Unit: PilotStation renders all three sub-components (video, LiDAR, controls)
- Unit: HUDOverlay displays correct telemetry values
- Playwright E2E: Pilot layout at desktop viewport
- Playwright E2E: Pilot layout at mobile viewport (stacked)
- Playwright E2E: Route `/pilot/:robotId` renders pilot station
- Quality gate passes

**Exit criteria:** SPEC written, pilot station renders with all sub-components, responsive layout verified, HUD displays data.

---

### Phase 10: Feature — Multi-Robot Fleet

**Goal:** Fleet overview dashboard with per-robot state management, split pilot views, and unified command mode.

**Depends on:** Phase 4, Phase 9

**Workflow:** SPEC > Research > TDD (RED) > Build (GREEN) > Sweep

**Tasks:**

- [ ] Write `.planning/knowledge/specs/SPEC-multi-robot-fleet.md`
- [ ] Build FleetOverview component (grid of robot cards with status indicators)
- [ ] Build RobotCard component (name, connection status, battery, thumbnail)
- [ ] Build per-robot dynamic Zustand stores (NOT fixed array — prevents 8-robot limit bug)
- [ ] Build useRobotStore factory (creates/destroys stores per robot connection)
- [ ] Build SplitPilotView (2-up pilot stations for simultaneous control)
- [ ] Build SwarmCommand mode (broadcast velocity to all connected robots)
- [ ] Build fleet connection manager (add/remove robot connections)
- [ ] Implement FleetPage route (`/fleet`)

**Research:**

- context7 MCP: Zustand dynamic store creation patterns
- UI/UX Pro Max: Fleet management dashboard patterns, multi-view layouts

**Testing:**

- Unit: Dynamic store factory creates/destroys stores correctly
- Unit: No fixed array limits on robot count
- Unit: SwarmCommand broadcasts to all connected robots
- Unit: FleetOverview renders correct number of robot cards
- Unit: SplitPilotView renders two independent pilot stations
- Playwright E2E: Fleet page with mock robot connections
- Quality gate passes

**Exit criteria:** SPEC written, dynamic stores verified, fleet overview renders, swarm command broadcasts, no fixed-array limits.

---

### Phase 11: Feature — SLAM Map

**Goal:** OccupancyGrid visualization with pan/zoom, robot position overlay, and on-demand fetch (not streaming).

**Depends on:** Phase 4

**Workflow:** SPEC > Research > TDD (RED) > Build (GREEN) > Sweep

**Tasks:**

- [ ] Write `.planning/knowledge/specs/SPEC-slam-map.md`
- [ ] Build OccupancyGridParser (decode nav_msgs/OccupancyGrid to typed array)
- [ ] Build MapCanvas component (Canvas 2D renderer for grid data)
- [ ] Implement d3-zoom for pan/zoom interaction on canvas
- [ ] Build RobotPositionOverlay (render robot pose on map from tf data)
- [ ] Build MapControls component (zoom buttons, reset view, fetch map button)
- [ ] Implement on-demand fetch pattern (service call, not topic subscription)
- [ ] Build MapPage route integration (`/map`)
- [ ] Handle resolution scaling (map resolution to canvas pixel mapping)

**Research:**

- context7 MCP: d3-zoom API with Canvas 2D
- context7 MCP: nav_msgs/OccupancyGrid message format
- Research agent: OccupancyGrid resolution and origin handling

**Testing:**

- Unit: OccupancyGridParser correctly decodes grid data (free, occupied, unknown)
- Unit: Grid-to-canvas coordinate transform (resolution, origin offset)
- Unit: Robot position maps correctly from world coords to canvas coords
- Unit: On-demand fetch triggers service call (not subscription)
- Playwright E2E: Pan/zoom interaction on rendered map
- Quality gate passes

**Exit criteria:** SPEC written, grid parsing verified, coordinate transforms correct, pan/zoom works, on-demand fetch pattern confirmed.

---

### Phase 12: Integration & Polish

**Goal:** Verify all features work together in actual views, harden edge cases, test responsive behavior end-to-end, and deploy.

**Depends on:** Phases 1-11

**Tasks:**

- [ ] **Integration verification** (explicit — prevents v2 overnight-build gap):
  - [ ] DashboardPage renders REAL panel grid with REAL telemetry widgets (not stubs)
  - [ ] FleetPage renders REAL robot cards with REAL connection status
  - [ ] MapPage renders REAL OccupancyGrid with REAL robot overlay
  - [ ] PilotPage renders REAL video + REAL LiDAR + REAL controls
  - [ ] Sidebar renders REAL connection manager with REAL connection state
- [ ] **Disconnect safety:**
  - [ ] E-stop triggers on any connection loss
  - [ ] Panels show disconnect state gracefully (not crashes)
  - [ ] Reconnection restores subscriptions automatically
- [ ] **Responsive polish (Playwright E2E at all 3 viewports):**
  - [ ] Desktop (1440x900): Full layout with sidebar
  - [ ] Tablet (768x1024): Collapsed sidebar, adjusted panels
  - [ ] Mobile (375x812): Bottom tab bar, carousel panels, stacked pilot
- [ ] **Performance audit:**
  - [ ] No unnecessary re-renders (React DevTools profiler)
  - [ ] Canvas rendering at 30fps minimum for LiDAR/Map
  - [ ] Memory stable over 10-minute connection (no leaks from RxJS subscriptions)
- [ ] **Final quality gate:**
  - [ ] `npm run lint` — zero warnings, zero errors
  - [ ] `tsc --noEmit` — zero type errors
  - [ ] `npm test -- --run` — all tests pass
  - [ ] `npm run build` — clean production build
  - [ ] Playwright full suite — all viewports pass
- [ ] **Deployment:**
  - [ ] Configure GitHub Pages deployment (GitHub Actions workflow)
  - [ ] Verify SPA routing works on GitHub Pages (404.html redirect)
  - [ ] Deploy to production

**Research:**

- context7 MCP: GitHub Actions for Vite deployment to GitHub Pages

**Testing:**

- Playwright E2E: Full integration test suite across all pages and viewports
- Performance: Memory profiling, render count assertions
- Deployment: Smoke test on GitHub Pages

**Exit criteria:** All views render real components (not stubs), all viewports pass E2E, quality gate green, deployed to GitHub Pages.

---

## Progress

| Phase | Name                  | Status      | Plan | Tests | Build | Sweep |
| ----- | --------------------- | ----------- | ---- | ----- | ----- | ----- |
| 1     | Foundation & Scaffold | Complete    | Done | Done  | Done  | Done  |
| 2     | Design System         | Complete    | Done | Done  | Done  | Done  |
| 3     | App Shell & Routing   | Complete    | Done | Done  | Done  | Done  |
| 4     | ROS Connection        | Complete    | Done | Done  | Done  | Done  |
| 5     | Telemetry Widgets     | Not started | —    | —     | —     | —     |
| 6     | Panel System          | Not started | —    | —     | —     | —     |
| 7     | Robot Control         | Not started | —    | —     | —     | —     |
| 8     | WebRTC Video          | Not started | —    | —     | —     | —     |
| 9     | FPOV Pilot Mode       | Not started | —    | —     | —     | —     |
| 10    | Multi-Robot Fleet     | Not started | —    | —     | —     | —     |
| 11    | SLAM Map              | Not started | —    | —     | —     | —     |
| 12    | Integration & Polish  | Not started | —    | —     | —     | —     |

## Dependency Graph

```
Phase 1 (Foundation)
  └─> Phase 2 (Design System)
        └─> Phase 3 (App Shell & Routing)
              ├─> Phase 4 (ROS Connection)
              │     ├─> Phase 5 (Telemetry Widgets)
              │     │     └─> Phase 6 (Panel System)
              │     ├─> Phase 7 (Robot Control)
              │     ├─> Phase 10 (Multi-Robot Fleet) *also needs Phase 9
              │     └─> Phase 11 (SLAM Map)
              └─> Phase 8 (WebRTC Video)
                    └─> Phase 9 (FPOV Pilot Mode) *also needs Phase 5, 7
                          └─> Phase 10 (Multi-Robot Fleet) *also needs Phase 4
Phase 12 (Integration & Polish) depends on ALL above
```
