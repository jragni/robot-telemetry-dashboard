# Robot Telemetry Dashboard v2

## What This Is

A ground-up rebuild of a robot telemetry dashboard — a React-based web application for monitoring, visualizing, and controlling ROS2 robots in real-time. Designed with a defense-contractor aesthetic (Anduril/Palantir-inspired), modular panel system, and simultaneous multi-robot support. Built for both desktop and mobile-web with identical button-based controls.

## Core Value

A professional, demo-worthy robot control dashboard that scales cleanly — in architecture, in number of robots, and in features — without the structural collapse that killed v1.

## Requirements

### Validated

<!-- Capabilities proven in v1 that carry forward as known-good requirements -->

- ✓ ROS2 communication via roslib/rosbridge WebSocket — existing
- ✓ WebRTC video streaming from robot cameras — existing
- ✓ Robot movement control via geometry_msgs/Twist publishing — existing
- ✓ LiDAR laser scan visualization (2D) — existing
- ✓ IMU telemetry display (orientation, acceleration) — existing
- ✓ Multiple robot connection management (add/remove/switch) — existing
- ✓ Dark/light theme support — existing
- ✓ Auto-reconnection on connection loss — existing
- ✓ Responsive layout (desktop + mobile) — existing
- ✓ Topic discovery from connected robots — existing

### Active

<!-- New capabilities for the rebuild — hypotheses until shipped and validated -->

**Architecture & Foundation:**
- [ ] Clean slate rebuild with new architecture: RxJS for data streams, Zustand for UI state, roslib as transport
- [ ] Scalable folder/file structure that won't collapse under feature growth
- [ ] TDD for core logic (RxJS streams, Zustand stores, connection management)
- [ ] Hybrid routing: React Router for major views (dashboard, pilot, fleet, map), tabs within views
- [ ] Proper logging utility with environment-based log levels (replace 52+ console.log statements)

**UI & Design System:**
- [ ] Defense-contractor UI aesthetic: dark charcoal background, electric blue accents, sleek and serious
- [ ] shadcn/Radix components heavily themed to match defense-contractor design system
- [ ] Grid-based drag & drop modular panel system with persistent layouts per view
- [ ] Core widget panels: Video Feed, LiDAR View, IMU Display, Control Pad, Topic List, Data Plot, Map, Connection Status
- [ ] Button-based controls that work identically on mobile-web and desktop

**Multi-Robot:**
- [ ] Simultaneous multi-robot control — not just switching, but actively controlling multiple robots at once
- [ ] Individual pilot views: split/grid of pilot views, each controlling a different robot
- [ ] Unified command mode: single interface sending commands to selected robots simultaneously (swarm-style)
- [ ] Fleet overview dashboard: aggregated status, robot health, quick selection
- [ ] Design for 2-5 robots in v1, architecture supports 10+

**FPOV Pilot Mode:**
- [ ] Split-view drone pilot station: video feed center, LiDAR minimap corner, controls overlaid
- [ ] Video-game-style HUD elements
- [ ] Works on both desktop and mobile-web

**Telemetry & Visualization:**
- [ ] Dynamic data plotting: auto-detect ROS2 topic types, pick best chart (time series, polar, gauge), user can tweak
- [ ] Colorized depth camera visualization (near=warm, far=cool heatmap)
- [ ] SLAM map visualization: render nav_msgs/OccupancyGrid via Canvas 2D with d3-zoom for pan/zoom
- [ ] On-demand map fetch (not continuous subscription) to manage bandwidth
- [ ] Robot position overlay on SLAM map
- [ ] Configurable: per-robot maps or merged shared map view

**Data Recording & Playback:**
- [ ] Record user-selected ROS2 topic streams to browser (IndexedDB)
- [ ] Playback recorded sessions in the dashboard
- [ ] Export recorded data as downloadable files (JSON/CSV)

**Connection & Safety:**
- [ ] Alert + auto-reconnect on robot disconnection during piloting (controls disabled until reconnected)
- [ ] Persistent panel layouts saved to localStorage per view

### Out of Scope

- 3D visualization (Three.js/WebGL point clouds) — adds massive complexity, 2D is sufficient for v1
- User authentication/accounts — direct-connect model, no login system
- Chatbot/AI control via edge AI — fully deferred, don't architect for it now
- Internationalization — English only for v1
- Custom backend/server — stays frontend-only, no API server or database beyond browser storage
- Sensor fusion (combining IMU + odometry, LiDAR + depth) — keep RxJS usage simple for v1
- Alerting/threshold monitoring on streams — defer to future version
- Waypoint navigation / path planning UI — SLAM map is read-only pan+zoom for v1
- Keyboard shortcuts system — focus on mouse/touch first

## Context

**Brownfield rebuild:** This replaces an existing v1 dashboard that suffered from:
- Context provider sprawl (4 nested contexts tangled together)
- Tight component-to-context coupling making reuse impossible
- Inconsistent file organization with many empty placeholder files
- Zero test coverage
- 52+ console.log statements left in production code
- Fragile roslib CommonJS workaround in vite.config.ts

**What worked in v1:** ROS/WebRTC communication patterns, basic sensor visualization, responsive layout concept. These patterns will be ported to the new architecture.

**Target user:** Robot operator who needs to monitor and control robots from desktop or mobile — and occasionally demo the system to others. The UI must look professional enough to impress.

**Robot environment:** ROS2 Humble on Ubuntu, rosbridge_suite for WebSocket, custom aiortc WebRTC server, Nginx reverse proxy. Robots operate primarily on local networks.

## Constraints

- **Framework**: React 19 + TypeScript — non-negotiable, team expertise
- **Robot Protocol**: ROS2 via roslib/rosbridge — can't change robot-side infrastructure
- **Build Tool**: Vite — best fit for React SPA, fast HMR, existing roslib workaround manageable
- **Deployment**: GitHub Pages — static hosting, free, simple
- **State Architecture**: Zustand for UI state + RxJS for data streams + roslib as transport layer
- **Component Library**: shadcn/ui + Radix — themed to defense-contractor aesthetic
- **Testing**: Vitest with TDD for core logic (RxJS streams, stores, connection management)
- **Approach**: Clean slate on new branch — port working logic from v1 as needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Zustand over React Context | Context sprawl killed v1 scalability; Zustand avoids provider nesting, supports sliced stores, fine-grained subscriptions | — Pending |
| RxJS for data streams | ROS topic subscriptions are inherently stream-based; RxJS gives throttling, buffering for recording, multi-subscriber fan-out, clean teardown | — Pending |
| roslib as thin transport | Keep roslib for WebSocket connection/reconnection only; wrap data subscriptions in RxJS Observables | — Pending |
| Canvas 2D for SLAM map | OccupancyGrid can be large (160KB+); Canvas pixel manipulation is faster than D3 DOM for grid data; use d3-zoom for pan/zoom on top | — Pending |
| On-demand map fetch | OccupancyGrid over rosbridge JSON can be 40-600KB per update; on-demand prevents bandwidth issues on remote connections | — Pending |
| Grid-based panel system | Modular, user-arrangeable panels like Grafana; layouts persist per view in localStorage | — Pending |
| Button controls over joystick | Must work identically on mobile-web and desktop; buttons are more cross-platform consistent than virtual joysticks | — Pending |
| Clean slate over incremental | v1 architecture is fundamentally broken (context sprawl, coupling, no tests); incremental rewrite would carry forward bad patterns | — Pending |
| TDD for core, not UI | RxJS streams and Zustand stores have clear inputs/outputs perfect for TDD; UI testing deferred | — Pending |

---
*Last updated: 2026-03-16 after initialization*
