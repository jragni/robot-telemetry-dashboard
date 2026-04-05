# Project Research Summary

**Project:** Robot Telemetry Dashboard (v4)
**Domain:** Real-time ROS2 robot command & control dashboard (browser-based)
**Researched:** 2026-03-22
**Confidence:** HIGH

## Executive Summary

This is a browser-based, single-operator robot command and control dashboard targeting the gap between developer-grade tools (Foxglove, RViz2) and enterprise defense platforms (Anduril Lattice, Palantir). The competitive advantage is not feature breadth — Foxglove has 23 panel types — but operational polish: a defense-contractor aesthetic that makes the dashboard look like it belongs in an ops center rather than a dev environment. The recommended architecture is a strict three-layer data pipeline: roslib (WebSocket transport) → RxJS (stream processing) → Zustand (UI state) → React (view). This pattern was validated in v2/v3 and the research confirms it as the correct foundation for v4.

The recommended stack is conservative and version-specific for good reasons. Vite 7 over Vite 8 avoids CJS interop breaking changes that affect roslib and react-grid-layout transitive dependencies. roslib 2.0.1 (now ESM-native) eliminates the `optimizeDeps.include` hack that caused silent failures in prior builds. React 19.0.4 with Recharts 3.8 requires an explicit `react-is` package override — this must be wired in during scaffolding or charts will silently fail to render. The design system (shadcn/ui CLI v4, unified radix-ui package, Tailwind 4 with OKLCH tokens) is fully specified and should be initialized once in Phase 2 so all subsequent components are built with design tokens from day one.

The highest-priority risks are all known from prior rebuilds: roslib topic subscriptions dying silently on WebSocket reconnect, RxJS zombie subscriptions from missing `useEffect` cleanup, test suites that pass while the screen is blank (proven v3 failure with 468 passing tests), and AI-assisted development producing features that never get wired into actual views (proven v2 failure). Every phase must end with a Playwright screenshot reviewed by a human. "Tests pass" is not a quality gate by itself — it is a necessary but insufficient condition for a visual product.

---

## Key Findings

### Recommended Stack

The stack is purpose-selected for a real-time WebSocket dashboard with robotics dependencies. The data layer (roslib 2.0.1 + RxJS 7.8.2 + Zustand 5.0.12) is a proven combination from v2/v3. The main v4 upgrade decisions are: Vite 7 (not 8) to avoid Rolldown CJS interop issues, roslib 2.0.1 which is now ESM-native (eliminates the CJS gotcha that broke every prior build), and shadcn/ui CLI v4 with unified `radix-ui` package. Testing has materially improved: Vitest 4.1.0 ships stable browser mode and visual regression support; Playwright 1.58.0 pairs as the E2E and screenshot layer.

**Core technologies:**
- React 19.0.4: UI framework — latest stable; Actions API simplifies async patterns
- TypeScript 5.9: Type safety — `import defer` useful for lazy-loading heavy telemetry modules
- Vite 7.x: Build tool — use 7 not 8; Vite 8 has CJS interop breaking changes affecting roslib deps
- Zustand 5.0.12: UI state — validated in v2/v3; uses native `useSyncExternalStore`
- RxJS 7.8.2: Stream processing — throttling, buffering, multi-cast of ROS topic streams
- roslib 2.0.1: ROS2 WebSocket transport — now ESM-native, built-in TS types, eliminates prior CJS hack
- shadcn/ui CLI v4 + unified `radix-ui`: Component library — Radix engine, CLI v4 presets
- Recharts 3.8.0: Time-series charts — requires `react-is` override for React 19 compat
- react-grid-layout 2.2.2: Panel grid — known ISS-008 rowHeight loop risk; mitigated by anchoring rowHeight to `window.innerHeight`
- Vitest 4.1.0 + Playwright 1.58.0: Testing — stable browser mode + visual regression

**Do not use:** `@types/roslib` (roslib 2.0 ships its own types), individual `@radix-ui/react-*` packages (use unified `radix-ui`), barrel files (ADR-001), Vite 8, Next.js, or D3 directly.

### Expected Features

The feature landscape is well-researched against Foxglove, RViz2, Anduril Lattice, PAL Robotics, and Stretch web interfaces. The defensible competitive position is "defense C2 polish, accessible as a browser tab." The decision to use fixed pre-designed views (not drag-and-drop) avoids the react-grid-layout complexity that caused ISS-008 in v2.

**Must have (table stakes) — v1 launch:**
- Rosbridge WebSocket connection with status indicator — foundation for all data flow
- Fleet overview with robot cards (name, status, last seen) — first thing operators see
- Real-time telemetry display with numeric values — proves the data pipeline
- Time-series plots for telemetry trends — Recharts, rolling window, streaming append
- Camera feed display — CompressedImage topic decoded in browser
- E-Stop button — safety-critical; always visible, always accessible in one click from any view
- Velocity/movement control (D-pad) — publishes geometry_msgs/Twist to /cmd_vel
- Dark + light theme toggle — defense aesthetic IS the product; both themes must be intentional
- Sidebar navigation (Fleet > Robot > Detail) — the IA designed in the v3 redesign

**Should have (differentiators) — v1.x:**
- Pilot view (camera + control overlay composite) — once camera and controls work independently
- Occupancy grid map rendering — on-demand fetch, Canvas2D + Web Worker; not a continuous subscription
- LiDAR scan visualization (2D radar-style) — canvas polar plot of LaserScan ranges
- IMU 3D orientation widget — Three.js or CSS 3D transforms for attitude indicator
- Responsive mobile layout — monitoring-only on mobile (bottom tab bar, swipeable cards)

**Defer (v2+):**
- 3D WebGL point cloud rendering — massive scope, GPU complexity
- Gamepad/joystick hardware support — Browser Gamepad API inconsistency across browsers
- Data recording/export — requires backend scope
- Drag-and-drop panel layout editor — caused ISS-008; fixed views serve the use case better
- Multi-user collaboration — explicitly out of scope (single-operator tool)

**Hard nos (anti-features):** Bag file playback, plugin/extension system, ROS2 parameter editing, AI/ML anomaly detection.

### Architecture Approach

The architecture follows a strict four-layer pipeline with no layer skipping: Transport (roslib) → Stream (RxJS) → State (Zustand) → View (React). Components never touch roslib directly. Each domain (connection, fleet, telemetry, control, map) has its own Zustand store — not slices of a monolith — so high-frequency telemetry updates cannot trigger re-evaluation in control or fleet state subscribers. The feature directory structure groups each domain under `src/features/[domain]/` containing stores, services, components, and types per ADR-002.

**Major components:**
1. `RosConnectionManager` — WebSocket lifecycle, exponential backoff reconnection (roslib has NO built-in reconnect), subscription registry for re-subscribe on reconnect
2. `TopicStreamFactory` — Singleton observable cache keyed by `robotId::topicName`; prevents duplicate subscriptions; handles cleanup on last unsubscribe
3. Domain stores (`useFleetStore`, `useTelemetryStore`, `useConnectionStore`, `useControlStore`, `useMapStore`) — normalized `Record<robotId, T>` shape; fine-grained selectors prevent cross-robot re-renders
4. `TelemetryRingBuffer` — Fixed-size ring buffer (class instance, NOT in Zustand) preventing memory growth at 100Hz; snapshots to store at throttled rate
5. `OccupancyGridRenderer` + `grid-worker.ts` — Canvas2D via Web Worker for large grid payloads; two-canvas stack (static grid layer + animated robot overlay)

**Key stream patterns:** `throttleTime(100)` for IMU (100Hz → 10Hz for UI), `distinctUntilChanged` for battery, `bufferTime(2000)` for diagnostics, single on-demand fetch for `/map`. Outbound commands rate-limited at 10Hz via `ControlStore`. Subscription cleanup: `useEffect` returns `() => sub.unsubscribe()`.

### Critical Pitfalls

1. **roslib subscriptions die silently on reconnect** — roslib reconnects the transport but does NOT re-subscribe topics. Dashboard shows "Connected" while telemetry is frozen. Fix: RxJS subscription registry in `RosConnectionManager`; on `ros.on('connection')`, re-subscribe all cached topics. Must be built before any telemetry feature is layered on top. Recovery cost if deferred: HIGH.

2. **Tests pass, app is blank** — Proven v3 failure (468 tests passed, blank screen). Unit tests verify code structure but not visual output. Fix: three-layer gate at every phase: unit tests + Playwright structural assertions + Playwright screenshot reviewed by a human. "Tests pass" is never sufficient for a visual product.

3. **Features built but never wired into views** — Proven v2 failure (DashboardView showed "Coming soon" while all features were built and tested). Fix: every phase that creates a component must wire it into its parent view in the same phase. Playwright test navigates to the route and asserts visible content exists.

4. **React re-render cascade from high-frequency ROS topics** — 100-200Hz IMU topics cause 500+ renders/second across telemetry panels; browser freezes. Fix: throttle at the RxJS layer, not the component layer. Zustand receives pre-throttled data. This pattern must be established before any telemetry UI is built.

5. **rowHeight infinite loop (ISS-008)** — Dynamic rowHeight computed from container height creates a circular dependency when panels stack vertically; browser crashes at 16,777,215px height. Fix: anchor `rowHeight` to `window.innerHeight` (stable external anchor) on `lg` breakpoint; use static 60px on `md`/`sm`. Known fix from ISS-008 post-mortem.

---

## Implications for Roadmap

The architecture research defines a clear build order with hard dependencies. The feature dependency graph confirms the same ordering. The pitfall research identifies which phases carry the most risk. Together they suggest a 12-phase structure.

### Phase 1: Scaffolding and Foundation
**Rationale:** Every subsequent phase depends on a working build with validated library compatibility. React 19 compatibility problems with Recharts and react-grid-layout must be resolved before anything is built on top of them.
**Delivers:** Vite 7 project with React 19, TypeScript 5.9, Tailwind 4, Vitest 4 + Playwright configured; `react-is` override applied; roslib 2.0 import smoke test; RGL smoke test; Node 20.19+ confirmed
**Avoids:** Pitfall 11 (React 19 compat gaps), Pitfall 12 (roslib CJS/ESM build failure)
**Research flag:** Standard patterns — skip research-phase.

### Phase 2: Design System
**Rationale:** All subsequent components must be built with design tokens from day one. Retrofitting a design system causes visual inconsistency and AI slop accumulation. Theme infrastructure must be the starting point, not an afterthought.
**Delivers:** shadcn/ui CLI v4 init (Radix engine), OKLCH design tokens, 2-weight typography (400/600), dark + light themes, `data-theme` attribute on `<html>` with Playwright assertion, shared `Show` component, shared `DataCard`
**Avoids:** Pitfall 9 (theme not on HTML root), AI slop visual patterns (no gradients, `rounded-sm`, no emoji)
**Research flag:** Standard patterns — skip research-phase.

### Phase 3: App Shell
**Rationale:** The sidebar-driven Fleet > Robot > Detail IA (designed in v3) must be the structural container before any feature views are built inside it. Building features before the shell means wiring them twice.
**Delivers:** Sidebar navigation (three-level hierarchy), header area, content area, route slots wired to shell
**Implements:** IA redesign from `memories/decisions/ia-redesign-v3.md`
**Avoids:** Pitfall 6 (WidthProvider layout thrashing — use `useElementSize` + ResizeObserver, not WidthProvider)
**Research flag:** Standard patterns — skip research-phase.

### Phase 4: Router
**Rationale:** Routes must be wired to shell slots before any feature component is built, so every component is immediately verifiable as reachable. This prevents the "features built but not wired" failure mode at its root.
**Delivers:** React Router with routes for fleet overview, robot workspace, pilot view, map view; Playwright deep-link smoke tests for each route
**Avoids:** Pitfall 8 (features not wired into views — routes are the integration surface)
**Research flag:** Standard patterns — skip research-phase.

### Phase 5: Transport Layer (Critical Path)
**Rationale:** The entire data pipeline depends on this layer. Nothing works until the rosbridge connection is established, and the reconnection + subscription registry pattern must be rock-solid before any feature subscribes to topics. This is the single highest-risk phase in the project.
**Delivers:** `RosConnectionManager` (WebSocket lifecycle, exponential backoff reconnection, subscription registry for re-subscribe on reconnect), `TopicStreamFactory` (observable cache), `ServiceCaller`, `useConnectionStore` (per-robot connection state), application-level heartbeat + zombie detection, latency display on robot cards
**Uses:** roslib 2.0.1, RxJS 7.8.2, Zustand 5.0.12
**Avoids:** Pitfall 1 (subscriptions die on reconnect), Pitfall 7 (WebSocket zombie connections), Pitfall 5 (RxJS zombie subscriptions)
**Research flag:** Needs research-phase — reconnection + subscription registry has implementation subtleties; heartbeat implementation needs validation against rosbridge 2.x behavior.

### Phase 6: Fleet Overview
**Rationale:** Fleet overview is the first screen operators see. It requires only connection state (Phase 5) and no telemetry data. Building it now validates the Fleet > Robot selection flow before telemetry is added.
**Delivers:** `useFleetStore` (robot registry, selection), `FleetOverview` component, `RobotCard` (name, status indicator, battery if available, sort by status), empty state for no robots connected
**Avoids:** Pitfall 8 (wired into Phase 3 shell in this same phase, verified by Playwright)
**Research flag:** Standard patterns — skip research-phase.

### Phase 7: Telemetry Data Layer and Widgets
**Rationale:** Read-only telemetry before control (read-write) validates the inbound pipeline in isolation. The RxJS pipeline recipes and ring buffer pattern must be established here before any UI widgets consume data.
**Delivers:** `useTelemetryStore`, `TelemetryRingBuffer` (ring buffer class, not in Zustand), RxJS pipelines per data type (`throttleTime` for IMU, `distinctUntilChanged` for battery, `bufferTime` for diagnostics), `ImuWidget`, `DataPlotWidget` (Recharts rolling window), topic auto-discovery
**Avoids:** Pitfall 2 (re-render cascade — throttle at RxJS layer), Pitfall 5 (zombie subscriptions — `useEffect` cleanup)
**Research flag:** Needs research-phase — Recharts streaming append performance at 10Hz with 300-point rolling window has known traps; ring buffer size tuning needs validation.

### Phase 8: Robot Workspace Layout
**Rationale:** Widgets exist from Phase 7; now compose them into a robot workspace. The `rowHeight` strategy must be finalized in this phase or ISS-008 will recur.
**Delivers:** Robot workspace view with panel grid (react-grid-layout, fixed pre-designed layout), widgets rendered in panels, ISS-008 fix (`rowHeight` anchored to `window.innerHeight`), `useElementSize` instead of WidthProvider, panel-level error boundaries
**Avoids:** Pitfall 6 (WidthProvider layout thrashing), Pitfall 10 (rowHeight infinite loop)
**Research flag:** Standard patterns — ISS-008 fix is documented in PITFALLS.md; skip research-phase.

### Phase 9: Control Layer
**Rationale:** Outbound commands require the inbound telemetry pipeline to already be working (Phase 7). Control is read-write and higher-risk than telemetry — validate the inbound pipeline first, then add outbound.
**Delivers:** `useControlStore` (E-Stop state, velocity, control mode), `EStopButton` (always visible, red, one-click accessible from every view), `VelocitySlider`, `DPad`, outbound command publishing at 10Hz rate limit, velocity clamping to safe ranges
**Avoids:** Security pitfall (velocity commands without rate limiting), UX pitfall (E-Stop must be reachable from every view within one click)
**Research flag:** Standard patterns — skip research-phase.

### Phase 10: Pilot View
**Rationale:** Composite view assembling camera feed + control overlay. Requires camera (Phase 7 telemetry pipeline), velocity controls (Phase 9), and E-Stop (Phase 9) to all exist first.
**Delivers:** Camera feed display (CompressedImage topic, JPEG decode in browser, frame drop handling, 30fps cap), `PilotView` (camera as background, HUD-style control overlay), immersive fullscreen toggle
**Research flag:** Needs research-phase — CompressedImage decode performance in browser and frame rate management have implementation-specific details worth validating before building.

### Phase 11: Map View
**Rationale:** Highest-complexity feature (Web Worker, canvas, large payloads, two-canvas stack). Deferred until all other features are stable to minimize risk. Dependent on transport layer (Phase 5) but not on control or telemetry widgets.
**Delivers:** `useMapStore`, on-demand `/map` fetch (subscribe, receive one message, unsubscribe — no continuous stream), `grid-worker.ts` (OccupancyGrid int8[] → RGBA Uint8ClampedArray in Web Worker via Transferable), `OccupancyGridRenderer` (two-canvas stack: static grid layer + animated robot overlay), `MapView` component, re-center button
**Avoids:** Pitfall 4 (canvas lifecycle leaks — `useRef`, `useEffect` cleanup, Web Worker transfer), Architecture anti-pattern 4 (continuous map subscription at ~16MB/message)
**Research flag:** Needs research-phase — Web Worker + OffscreenCanvas + Transferable patterns have browser compat nuances; validate current (2026) support matrix before committing to OffscreenCanvas.

### Phase 12: Integration, Polish, and E2E
**Rationale:** Explicit final phase to verify all routes work end-to-end, execute the "Looks Done But Isn't" checklist, and apply visual polish pass. Prevents phased development from leaving unverified integration seams.
**Delivers:** Full E2E smoke tests for every route; "Looks Done But Isn't" checklist execution (WebSocket reconnection, theme persistence, router deep links, canvas cleanup, E-Stop reachability from all views, multi-robot isolation, mobile responsiveness, empty states, error boundaries, stale data indicators, light theme readability); visual polish pass; screenshot scoring (AI Slop / Defense Aesthetic / Polish dimensions); responsive mobile layout
**Research flag:** Standard patterns — skip research-phase.

### Phase Ordering Rationale

- **Foundation before features (Phases 1-4):** Compatibility confirmed, design tokens established, shell and routes wired before any feature component exists. Prevents the "retrofit everything later" problem.
- **Transport before data before UI (Phases 5-7):** The three-layer pipeline must exist in order. No feature can be built before its foundational layer is independently tested.
- **Read before write (Phase 7 before Phase 9):** Validate the inbound telemetry pipeline before adding outbound control commands. Lower-risk path to a working state.
- **Composites last (Phases 10-11):** Pilot view and map view are composite features that assemble earlier primitives. They cannot be meaningfully built until those primitives exist.
- **Integration gate (Phase 12):** Explicit final phase prevents "almost done" features that are actually not wired or not visually correct.
- **Each phase leaves the app in a working, demonstrable state** — no "wire later" phases.

### Research Flags

Phases needing deeper research during planning:
- **Phase 5 (Transport Layer):** rosbridge 2.x subscription re-subscribe behavior on reconnect; heartbeat implementation against rosbridge API; roslib 2.0 `ros.on('connection')` event behavior on reconnect vs. initial connect
- **Phase 7 (Telemetry Data Layer):** Recharts streaming performance at 10Hz with rolling 300-point window; ring buffer size tuning for memory vs. history tradeoffs at different topic frequencies
- **Phase 10 (Pilot View):** Browser CompressedImage decode performance for target robot's camera resolution; frame rate cap strategies
- **Phase 11 (Map View):** OffscreenCanvas browser support matrix as of 2026; Web Worker + Transferable patterns for ImageBitmap; two-canvas stack interaction with React refs

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 1 (Scaffolding):** Vite 7 setup is standard; package overrides documented in STACK.md
- **Phase 2 (Design System):** shadcn/ui CLI v4 init is documented; OKLCH token patterns are established
- **Phase 3 (App Shell):** Sidebar IA is fully designed in the v3 IA redesign decision
- **Phase 4 (Router):** React Router v6/v7 patterns are standard
- **Phase 8 (Workspace Layout):** ISS-008 fix and WidthProvider replacement are documented in PITFALLS.md
- **Phase 9 (Control Layer):** geometry_msgs/Twist publishing pattern is standard
- **Phase 12 (Integration):** Quality gate process is defined; "Looks Done But Isn't" checklist is in PITFALLS.md

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Every recommendation backed by official release notes, npm, and changelog verification. Version-specific decisions (Vite 7 not 8, roslib 2.0.1) are well-evidenced. Two MEDIUM-confidence items require Phase 1 smoke test validation: Recharts React 19 compat and react-grid-layout React 19 compat. |
| Features | HIGH | Corroborated across Foxglove docs, RViz2 docs, defense C2 literature, and multiple real-world ROS teleoperation projects. Feature dependency graph is logically consistent with architecture. Anti-features section is opinionated and well-reasoned. |
| Architecture | HIGH | Three-layer pipeline validated in v2/v3. roslib source code verified to have no built-in reconnection. RxJS pipeline recipes sourced from official docs and confirmed community patterns. Zustand multi-store pattern sourced from official Zustand repository discussions. |
| Pitfalls | HIGH | Combines 3 internal post-mortems (v1, v2, v3) with external issue tracker research. Most critical pitfalls are proven failures from prior builds, not speculation. Recovery costs are assessed from actual refactoring experience. |

**Overall confidence:** HIGH

### Gaps to Address

- **react-grid-layout React 19 compat:** The `react-grid-layout-19` community fork may be required. Validate in Phase 1 scaffolding. If the fork is needed, assess its maintenance status before committing.
- **roslib 2.0.1 ESM import in Vite 7:** STACK.md notes this eliminates the CJS workaround, but this must be confirmed with an actual build smoke test in Phase 1. Do not assume — verify.
- **rosbridge 2.x reconnect behavior:** The subscription re-subscribe strategy assumes `ros.on('connection')` fires reliably on reconnect in roslib 2.0. Verify against the roslib 2.0 changelog and source before Phase 5 implementation begins.
- **OccupancyGrid payload size in practice:** Research cites 16MB+ for 4000x4000 grids. Actual environments may be significantly smaller (512x512 = ~256KB). Measure in the target robot environment before over-engineering the Web Worker path.
- **Camera feed decode performance:** CompressedImage topic decode in browser is unvalidated for the target robot's camera resolution and publish rate. Phase 10 research should benchmark this before building.

---

## Sources

### Primary (HIGH confidence)
- [react.dev/versions](https://react.dev/versions) — React 19.0.4 confirmed
- [devblogs.microsoft.com/typescript](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/) — TypeScript 5.9 GA
- [vite.dev/releases](https://vite.dev/releases) + [vite.dev/guide/migration](https://vite.dev/guide/migration) — Vite 7 stable; Vite 8 CJS interop breaking changes
- [npmjs.com/package/roslib](https://www.npmjs.com/package/roslib) — 2.0.1 ESM-native, built-in TS types
- [github.com/RobotWebTools/roslibjs](https://github.com/RobotWebTools/roslibjs) — source verified: no built-in reconnection; Issue #246 confirmed
- [github.com/pmndrs/zustand/discussions/2496](https://github.com/pmndrs/zustand/discussions/2496) — multi-store vs. slices, official repo
- [ui.shadcn.com changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — CLI v4 March 2026; unified radix-ui February 2026
- [vitest.dev/blog/vitest-4](https://vitest.dev/blog/vitest-4) — stable browser mode, visual regression
- [playwright.dev/docs/release-notes](https://playwright.dev/docs/release-notes) — 1.58.0
- [docs.foxglove.dev/docs/visualization/panels](https://docs.foxglove.dev/docs/visualization/panels) — feature landscape comparison
- [web.dev/articles/offscreen-canvas](https://web.dev/articles/offscreen-canvas) — OffscreenCanvas Web Worker patterns
- [docs.ros.org OccupancyGrid](http://docs.ros.org/en/noetic/api/nav_msgs/html/msg/OccupancyGrid.html) — message format

### Secondary (MEDIUM confidence)
- [tkdodo.eu/blog/working-with-zustand](https://tkdodo.eu/blog/working-with-zustand) — selector patterns
- [recharts React 19 issue #4558](https://github.com/recharts/recharts/issues/4558) — react-is override documented
- [react-grid-layout Issue #2176](https://github.com/react-grid-layout/react-grid-layout/issues/2176) — React 18/19 resize issue
- [learnrxjs.io](https://www.learnrxjs.io) — RxJS operator recipes (throttleTime, scan, bufferTime)
- [Anduril Lattice C2](https://www.anduril.com/lattice/command-and-control) — defense C2 feature comparison
- [PAL Robotics web UI](https://pal-robotics.com/blog/web-user-interface-how-to-teleoperate-your-robot/) — teleoperation UX patterns

### Internal Post-Mortems (HIGH confidence for this project)
- `memories/decisions/v1-problems.md` — Context provider sprawl, 52 console.logs, zero tests
- `memories/bugs-gotchas/v2-bugs-and-gotchas.md` — ISS-008 infinite loop, barrel file bloat, Phase 8 blank screen post-mortem
- `memories/decisions/ia-redesign-v3.md` — Sidebar-driven Fleet > Robot > Detail IA

---
*Research completed: 2026-03-22*
*Ready for roadmap: yes*
