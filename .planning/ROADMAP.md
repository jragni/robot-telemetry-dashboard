# Roadmap: Robot Telemetry Dashboard v2

## Overview

Ground-up rebuild of the robot telemetry dashboard with a scalable RxJS + Zustand architecture, defense-contractor UI aesthetic, simultaneous multi-robot control, FPOV pilot mode, SLAM visualization, and modular panel system. Clean slate on `EPIC/v2-rebuild` branch, porting proven v1 patterns into the new architecture. TDD for core logic, Playwright for UI verification, zero tolerance for errors.

## Domain Expertise

None (no domain skill files available)

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Scaffold** — Vite + React 19 + TypeScript + Zustand + RxJS + React Router + Vitest + Playwright setup
- [ ] **Phase 2: Design System** — Defense-contractor theme, shadcn theming, color tokens, typography, core UI primitives
- [ ] **Phase 3: ROS Communication Layer** — roslib transport + RxJS Observable wrappers + Zustand connection stores + TDD
- [ ] **Phase 4: WebRTC Video Layer** — Signaling client + RxJS stream + video component + reconnection logic
- [ ] **Phase 5: Panel System** — Grid-based drag & drop layout engine, panel registry, layout persistence
- [ ] **Phase 6: Telemetry Widgets** — IMU, LiDAR, topic list, dynamic data plotting, depth camera panels
- [ ] **Phase 7: Robot Control** — Button-based control pad, velocity management, topic selector, e-stop
- [ ] **Phase 8: FPOV Pilot Mode** — Split-view pilot station, HUD elements, LiDAR minimap, mobile + desktop
- [ ] **Phase 9: Multi-Robot & Fleet** — Simultaneous control, individual pilot views, unified commands, fleet overview
- [ ] **Phase 10: SLAM Map Visualization** — OccupancyGrid Canvas 2D renderer, d3-zoom, robot position, on-demand fetch
- [ ] **Phase 11: Data Recording & Playback** — RxJS stream recording, IndexedDB storage, playback engine, export
- [ ] **Phase 12: Integration & Polish** — Cross-feature integration, disconnect safety, responsive polish, deployment
- [ ] **Phase 13: View Wiring** — Wire DashboardView and MapView to PanelGrid, fix integration gaps from overnight build

## Phase Details

### Phase 1: Foundation & Scaffold

**Goal:** Clean project structure with all tooling configured — builds, lints, tests, and routes work before any features
**Depends on:** Nothing (first phase)
**Research:** Unlikely (established patterns — Vite + React + Zustand + RxJS all well-documented)
**Testing:** Vitest smoke tests + Playwright dev server verification
**Plans:** 3 plans

Plans:

- [ ] 01-01: Vite + React 19 + TypeScript project init with strict tsconfig, ESLint 9, Prettier, Husky
- [ ] 01-02: Zustand + RxJS + React Router setup with folder structure and path aliases
- [ ] 01-03: Vitest + Playwright configuration with example tests passing

### Phase 2: Design System

**Goal:** Complete defense-contractor visual language — every component built after this inherits the aesthetic automatically
**Depends on:** Phase 1
**Research:** Unlikely (shadcn theming is customization work)
**Testing:** Playwright visual snapshots of component gallery, Vitest for theme utility functions
**Plans:** 4 plans

Plans:

- [ ] 02-01: Color tokens, CSS custom properties, dark theme foundation (charcoal + electric blue palette)
- [ ] 02-02: Typography scale, spacing system, shadcn/Radix component theming overrides
- [ ] 02-03: Core UI primitives — Button, Card, Dialog, Select, Tooltip, StatusIndicator styled to spec
- [ ] 02-04: Responsive breakpoints, mobile-first utilities, Sonner toast theming

### Phase 3: ROS Communication Layer

**Goal:** Type-safe RxJS Observable wrappers around roslib with Zustand stores — the data backbone for all telemetry
**Depends on:** Phase 1
**Research:** Likely (RxJS + roslib integration is novel)
**Research topics:** RxJS 7 WebSocket patterns, roslib API for programmatic subscribe/unsubscribe, Observable teardown, fromEvent patterns
**Testing:** Vitest TDD — unit tests for every Observable factory, store action, and connection state transition
**Plans:** 5 plans

Plans:

- [ ] 03-01: roslib transport service — connection lifecycle, reconnection with configurable retry
- [ ] 03-02: RxJS Observable factories — topic subscription wrapper, publisher wrapper, topic discovery
- [ ] 03-03: Zustand connection store — robot CRUD, active selection, connection state, localStorage persistence
- [ ] 03-04: RxJS-to-Zustand bridge — stream data pushed into stores for React consumption
- [ ] 03-05: Logging utility with environment-based log levels (replace console.log pattern)

### Phase 4: WebRTC Video Layer

**Goal:** Reliable video streaming from robot cameras with RxJS-managed connection state
**Depends on:** Phase 3 (shares connection infrastructure)
**Research:** Unlikely (porting v1 WebRTC patterns with RxJS wrapper)
**Testing:** Vitest TDD for signaling client and connection state machine, Playwright for video element rendering
**Plans:** 3 plans

Plans:

- [ ] 04-01: Signaling client refactor — typed event emitter, fetch with AbortController timeout
- [ ] 04-02: WebRTC RxJS stream — peer connection lifecycle as Observable, track events, reconnection
- [ ] 04-03: Zustand WebRTC store + VideoFeed component with connection status overlay

### Phase 5: Panel System

**Goal:** Grid-based drag & drop modular layout engine — users arrange panels, layouts persist per view
**Depends on:** Phase 2 (needs design system), Phase 1 (needs routing)
**Research:** Likely (grid layout library selection)
**Research topics:** react-grid-layout vs dnd-kit for grid panels, layout serialization, responsive grid breakpoints, localStorage persistence patterns
**Testing:** Vitest for layout serialization/persistence logic, Playwright for drag-drop interactions and layout restore
**Plans:** 4 plans

Plans:

- [ ] 05-01: Panel registry — define panel types, metadata, default sizes, render functions
- [ ] 05-02: Grid layout engine — drag & drop, resize, snap-to-grid using chosen library
- [ ] 05-03: Layout persistence — save/restore per view to localStorage, default layouts
- [ ] 05-04: View routing integration — Dashboard, Pilot, Fleet, Map views with panel support

### Phase 6: Telemetry Widgets

**Goal:** All sensor visualization panels working as self-contained widgets in the panel system
**Depends on:** Phase 3 (ROS layer), Phase 5 (panel system), Phase 2 (design system)
**Research:** Unlikely (internal component work using established RxJS subscription patterns)
**Testing:** Vitest for data transformation helpers, Playwright for widget rendering with mock data
**Plans:** 5 plans

Plans:

- [ ] 06-01: IMU widget — orientation display, acceleration data, digital + plot views
- [ ] 06-02: LiDAR widget — 2D laser scan Canvas rendering with zoom controls
- [ ] 06-03: Topic list widget — auto-discovered topics, subscription toggle, message preview
- [ ] 06-04: Dynamic data plotting widget — auto-detect topic type, pick best chart, user tweakable
- [ ] 06-05: Depth camera widget — colorized heatmap visualization (near=warm, far=cool)

### Phase 7: Robot Control

**Goal:** Button-based control pad that works identically on desktop and mobile-web
**Depends on:** Phase 3 (ROS publisher), Phase 2 (design system)
**Research:** Unlikely (porting v1 control logic to new architecture)
**Testing:** Vitest TDD for velocity calculation and Twist message construction, Playwright for button interactions and e-stop
**Plans:** 3 plans

Plans:

- [ ] 07-01: Control store — velocity state, direction commands, Twist message construction
- [ ] 07-02: Control pad component — directional buttons, e-stop, topic selector
- [ ] 07-03: Velocity sliders + connection status integration, mobile-web touch optimization

### Phase 8: FPOV Pilot Mode

**Goal:** Immersive split-view drone pilot station with HUD elements, working on both desktop and mobile
**Depends on:** Phase 4 (video), Phase 6 (LiDAR widget), Phase 7 (controls)
**Research:** Unlikely (internal UI composition using existing components)
**Testing:** Playwright for layout verification on desktop and mobile viewports, interaction testing
**Plans:** 4 plans

Plans:

- [ ] 08-01: Pilot view layout — video feed center, LiDAR minimap corner, controls overlay
- [ ] 08-02: HUD elements — connection status, velocity readout, battery, heading indicator
- [ ] 08-03: Mobile pilot layout — touch-optimized, responsive breakpoints, full-screen video
- [ ] 08-04: Pilot mode routing + keyboard/touch control binding

### Phase 9: Multi-Robot & Fleet

**Goal:** Simultaneously control multiple robots with individual pilot views and unified swarm commands
**Depends on:** Phase 3 (ROS layer), Phase 7 (controls), Phase 8 (pilot mode)
**Research:** Likely (architecturally novel multi-robot patterns)
**Research topics:** Zustand per-robot store patterns, RxJS multi-stream management, concurrent WebSocket connections, fleet state aggregation
**Testing:** Vitest TDD for multi-robot store isolation and command broadcasting, Playwright for fleet UI and split pilot views
**Plans:** 5 plans

Plans:

- [ ] 09-01: Per-robot store architecture — isolated Zustand stores per robot connection
- [ ] 09-02: Multi-robot connection manager — concurrent connections, health monitoring
- [ ] 09-03: Fleet overview dashboard — aggregated status cards, robot health, quick selection
- [ ] 09-04: Split pilot views — grid of individual pilot views, each controlling a different robot
- [ ] 09-05: Unified command mode — select robots, broadcast commands simultaneously

### Phase 10: SLAM Map Visualization

**Goal:** Render OccupancyGrid maps with Canvas 2D, pan/zoom, robot position overlay, on-demand fetch
**Depends on:** Phase 3 (ROS layer), Phase 5 (panel system)
**Research:** Likely (Canvas 2D grid rendering patterns)
**Research topics:** Canvas 2D large grid rendering performance, d3-zoom with Canvas integration, OccupancyGrid message format parsing, multi-robot map merging strategies
**Testing:** Vitest for OccupancyGrid data parsing and coordinate transforms, Playwright for Canvas rendering and zoom/pan interactions
**Plans:** 4 plans

Plans:

- [ ] 10-01: OccupancyGrid parser — message deserialization, grid-to-pixel coordinate mapping
- [ ] 10-02: Canvas 2D renderer — efficient grid drawing, color mapping (free/occupied/unknown)
- [ ] 10-03: d3-zoom integration — pan/zoom on Canvas, robot position marker overlay
- [ ] 10-04: On-demand fetch + configurable per-robot vs merged map view

### Phase 11: Data Recording & Playback

**Goal:** Record selected ROS topic streams to IndexedDB, replay in dashboard, export as files
**Depends on:** Phase 3 (RxJS streams), Phase 6 (telemetry widgets)
**Research:** Likely (IndexedDB for stream recording)
**Research topics:** IndexedDB with RxJS tap/buffer patterns, Dexie.js vs native IndexedDB, large dataset export to JSON/CSV, playback timing strategies
**Testing:** Vitest TDD for recording buffer logic and IndexedDB CRUD, Playwright for record/playback UI flow
**Plans:** 4 plans

Plans:

- [ ] 11-01: Recording engine — RxJS tap into streams, buffer to IndexedDB, session metadata
- [ ] 11-02: Session management UI — start/stop recording, select topics, session list
- [ ] 11-03: Playback engine — replay recorded data through widgets at original or adjusted speed
- [ ] 11-04: Export — download sessions as JSON/CSV files, format selection

### Phase 12: Integration & Polish

**Goal:** All features working together seamlessly, responsive on all devices, deployed to GitHub Pages
**Depends on:** All previous phases
**Research:** Unlikely (integration work using established patterns)
**Testing:** Full Playwright E2E test suite across all views and breakpoints, Vitest coverage report
**Plans:** 4 plans

Plans:

- [ ] 12-01: Cross-feature integration testing — panel widgets + pilot mode + fleet + recording all working together
- [ ] 12-02: Disconnect safety — alert + auto-reconnect, controls disabled, graceful degradation
- [ ] 12-03: Responsive polish — mobile-web and desktop breakpoints verified across all views
- [ ] 12-04: GitHub Pages deployment, build optimization, final E2E verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

| Phase                         | Plans Complete | Status      | Completed |
| ----------------------------- | -------------- | ----------- | --------- |
| 1. Foundation & Scaffold      | 0/3            | Not started | -         |
| 2. Design System              | 0/4            | Not started | -         |
| 3. ROS Communication Layer    | 0/5            | Not started | -         |
| 4. WebRTC Video Layer         | 0/3            | Not started | -         |
| 5. Panel System               | 0/4            | Not started | -         |
| 6. Telemetry Widgets          | 0/5            | Not started | -         |
| 7. Robot Control              | 0/3            | Not started | -         |
| 8. FPOV Pilot Mode            | 0/4            | Not started | -         |
| 9. Multi-Robot & Fleet        | 0/5            | Not started | -         |
| 10. SLAM Map Visualization    | 0/4            | Not started | -         |
| 11. Data Recording & Playback | 0/4            | Not started | -         |
| 12. Integration & Polish      | 0/4            | Not started | -         |
