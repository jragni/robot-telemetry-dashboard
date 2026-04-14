# Roadmap

Living document of what's been built, what's in progress, and what's planned.

## Built

### Foundation

- **Scaffolding** — Vite 7, React 19, TypeScript 5.9, Vitest, Playwright, ESLint, Prettier, shadcn/ui
- **Design System** — Midnight Operations OKLCH palette (hue 260), Exo + Roboto Mono fonts, Lucide icons, `@theme inline` pattern, dark/light themes
- **App Shell** — Collapsible sidebar (200px/48px), header with breadcrumb, status bar, mobile drawer, dark-first theme toggle
- **Folder Structure** — Feature-domain organization, eslint-plugin-boundaries enforcing Shared → Features → App import rules

### Features

- **Landing Page** — CX2-inspired hero, features section, problem/solution, CTA, footer
- **Fleet Management** — Connection store (Zustand + localStorage persistence), RobotCard (shadcn Card + 6 subcomponents), AddRobotModal with Zod validation, fleet empty state
- **Robot Workspace** — 3x2 panel grid with minimize/maximize/restore. Thin orchestrator pattern — each panel owns its ROS subscriptions. WorkspacePanel accepts Component prop for rendering.
  - **Camera** — WebRTC video stream via aiortc signaling, empty state when disconnected
  - **LiDAR** — Canvas 2D top-down scatter plot, distance-colored points, range circles, zoom controls
  - **System Status** — Connection state, uptime, battery, ROS graph (nodes/topics/services/actions) with expandable rows
  - **IMU Attitude** — 4 visualization modes (attitude+compass, numbers, attitude-only, 3D wireframe), mode selector
  - **Controls** — D-pad with press-and-hold, velocity sliders, E-STOP, keyboard support (arrow keys + Escape), Pilot Mode CTA
  - **Telemetry** — Canvas 2D time-series chart, multi-type parser (Odometry, Twist, IMU, Battery, LaserScan), auto-scaled axes
- **Mobile Workspace** — Single-panel tab bar layout, panel dictionary pattern, only active panel subscribes
- **Pilot Mode** — Fullscreen HUD with camera feed, LiDAR minimap, compass, gyro readout, controls, status bar

### Infrastructure

- **ROS 2 Data Layer** — roslib 2.x (ESM) → useRosSubscriber → per-topic hooks (useLidarSubscription, useImuSubscription, etc.) → Zod schema validation → RAF throttle → React state
- **Connection Manager** — Singleton class, reconnection with exponential backoff, connected-at timestamps, intentional disconnect guard
- **WebRTC** — SignalingClient for aiortc SDP exchange, peer connection lifecycle, reconnection
- **Topic Management** — useTopicManager hook: auto-discovery, per-panel filtering by message type, auto-select first valid topic
- **Convention Enforcement** — Pre-commit hooks (lint-staged: eslint, prettier, check-conventions.sh), pre-push hooks (npm run build + vitest run)
- **Observability** — Snapshot/scorecard scripts, dispatch logs, session reports in .planning/

### Code Quality

- 430+ unit tests across 60 test files
- Barrel imports for @/hooks, @/utils, feature components/hooks
- Co-located types (Component/Component.types.ts)
- Lookup object pattern replacing chained ternaries (STATUS_DISPLAY, CONNECTION_BUTTON, MOBILE_PANEL_MAP, VARIANT_VIEWS)
- Pre-commit convention checks: deep barrel imports, duplicate module imports, inline types, missing JSDoc

## Current State

- All features work in disconnected mode (empty states, mock-ready)
- Real ROS 2 connection tested via Cloudflare Tunnel to Raspberry Pi
- **lastSeen** field exists end-to-end but is never populated (no trigger sets the timestamp)
- 40 pre-existing lint errors (backlog T-074)
- PanelShowcase (mockups page) shows panels in disconnected state since panels now self-subscribe

## Planned

### Housekeeping (in progress)

- T-074: Lint error sweep (40 errors)
- T-077: Barrel imports sweep (PR #87, ready to merge)
- T-093: Dead code sweep (PR #88, ready to merge)
- T-100: Utils test folder restructure (PR #86, ready to merge)

### Next

- T-092: README overhaul — screenshot/GIF, design decisions, known limitations
- T-094: GitHub repo metadata — description, topics, website URL
- T-098: Pilot reconnect button — reconnect action in pilot status bar when disconnected
- Wire lastSeen — populate timestamp on ROS message receipt or disconnect
- Mockups page — living design system reference with mock data flowing through real components

### Visual Polish

- T-052: MIL-STD-1472H status indicators (color + icon + text on all indicators)
- T-065: Responsive polish (desktop resize, mobile layout, light mode contrast)
- T-085: WireframeView body-frame axes
- T-091: Mobile LiDAR minimap color alignment

### Testing

- T-070: Fleet feature tests (unit + E2E)
- T-072: Pilot feature tests (unit + E2E)
- T-073: Workspace feature tests (unit + E2E)

### Documentation

- T-069: JSDoc sweep (all exported functions)
- T-099: JSDoc @param → @prop conversion on components

## Not Planned

- Multi-robot simultaneous pilot mode
- Multi-echo LiDAR support
- ROS 2 action client (goal/feedback/result)
- User authentication or access control
- Persistent telemetry storage / replay
