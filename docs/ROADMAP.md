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

### Hardening & Reliability (2026-05)

- **Low-bandwidth resilience (T-104)** — latest-wins per-topic coalescing at `useRosSubscriber`; parse/validate once per RAF, fixing the LTE flush-storm freeze
- **CBOR / non-finite safety (T-150)** — `normalizeCborMessage` converts TypedArrays → plain arrays and NaN/±Inf → null at the transport boundary
- **WebRTC reconnect hardening (T-152/T-162/T-163)** — clear-before-reschedule timer guard, double-fire guard with trace, step-context (`ConnectStep`) boundary logging, stable `onStatusChange` ref
- **Data null-safety** — battery voltage/percentage nullable with finite/≥0 guards (T-164/T-166); IMU orientation surfaces an honest loss-of-fix state (OrientationUnknown panel + dimmed `---°` compass) instead of a fake-level identity (T-165)
- **WebRTC stats overlay** — live RTT/bitrate instrumentation hook + pilot overlay
- **Connection manager** — `lastSeen` stamped on every connection-state change; intentional-disconnect guard; exponential backoff

### Process & Tooling (2026-05)

- **Antagonistic PR review** — surface-scoped reviewer matrix (BLOCK/WARN/NIT), resolution rules, plain-text inline comments (`docs/PR-REVIEW.md`)
- **GitHub Flow** — single `main` + short-lived branches; `quality-gate` CI gate; migrated 2026-05-30 from the dev/uat/main three-tier flow
- **Headless UAT spec** — `e2e/uat`, robot URL via `UAT_ROBOT_URL`; manual driver checklist
- **Observability** — `.planning/` dispatch logs, snapshots, scorecards, session reports, UAT findings

### Code Quality

- 545 unit tests across 70 test files (vitest); Playwright smoke + integration (fake-rosbridge) + UAT suites
- Barrel imports for @/hooks, @/utils, feature components/hooks
- Co-located types (Component/Component.types.ts)
- Lookup object pattern replacing chained ternaries (STATUS_DISPLAY, CONNECTION_BUTTON, MOBILE_PANEL_MAP, VARIANT_VIEWS)
- Pre-commit convention checks (lint-staged) + pre-push build + vitest; `npm run lint` clean

## Current State

- All features work in disconnected mode (empty states, mock-ready)
- Real ROS 2 connection tested via Cloudflare Tunnel to Raspberry Pi
- **lastSeen** is populated on connection-state changes (connect / disconnect / error / close / reconnect-failure) in `ConnectionManager` — semantic is "last contact", not "last message"
- Lint is clean (`npm run lint` — 0 errors; T-074 swept)
- PanelShowcase (mockups page) shows panels in disconnected state by design, since panels now self-subscribe

## Planned

High-level grouping only — ticket detail lives in root `ISSUES.md`, which is the live backlog. (Older ISSUES sections still list some already-shipped items, e.g. T-074/T-077/T-093/T-100/T-098/T-104; ISSUES.md is mid-reconcile.)

### Type design

- **T-167** — collapse per-axis-nullable IMU angles into a single `orientation | null` discriminator (deferred from PR #131 review; no live bug)

### Mobile UX — Bug Hunt Wave B/C (mostly [VISUAL], needs the visual pipeline)

- **T-154** — touch targets <44px (D-pad, E-STOP, header icon buttons)
- **T-116** — press-and-hold zoom still hits desktop PilotHud/PilotControls (mobile already guarded)
- **T-158 / T-159** — iOS auto-zoom on <16px inputs; Add-Robot modal field hardening
- **T-065a** — controls scrollbar (grid gutters + ControlsPanel spacing + container-query breakpoints)
- **T-111** — RobotCard URL copy-to-clipboard affordance
- **T-114** — Add-Robot modal feels frozen during a background reconnect (validation on the critical path)

### Visual polish (visual pipeline)

- **T-052** — MIL-STD-1472H status indicators (color + icon + text everywhere)
- **T-065b / T-065c** — mobile layout trigger + camera tab; light-mode contrast audit
- **T-076** — Pilot Mode CTA below the fold on 14" laptops (discoverability)
- **T-085** — WireframeView body-frame axes
- **T-091** — mobile LiDAR minimap color alignment

### Bugs

- **T-160** — footer StatusBar is hardcoded; wire to live connection/topic state
- **T-117** — commit canvas-content visual-regression baselines (2 tests currently skipped)

### Test coverage

- **T-070 / T-072 / T-073** — fleet / pilot / workspace feature tests (unit + E2E)

### Bigger bets (not yet ticketed)

- **Bandwidth** — foxglove_bridge (binary CDR, drop-in) → a custom `ros2-webrtc-bridge` pip package (P2P DataChannels, zero-install viewer). Research: `docs/research/webrtc-bandwidth.md`.
- **Pi robot-brain** — Raspberry Pi + Claude API self-programming robot with dashboard chat control (Qwen hybrid).
- **Per-PR preview deploy** — replace local-only visual review; note the GH Pages base-path caveat (see CLAUDE.md Branch Strategy).

## Not Planned

- Multi-robot simultaneous pilot mode
- Multi-echo LiDAR support
- ROS 2 action client (goal/feedback/result)
- User authentication or access control
- Persistent telemetry storage / replay
