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
- T-095: Pilot feature folder conventions — PR #70
- T-096: Fleet feature folder conventions — PR #68
- T-097: Workspace feature folder conventions — PR #69
- T-075: Hooks restructure — PR #71
- T-088a: LidarPanel self-subscription — PR #73
- T-088b: ImuPanel self-subscription — PR #75
- T-088c: TelemetryPanel self-subscription — PR #74
- T-088d: ControlsPanel self-subscription — PR #79
- T-088e: CameraPanel self-subscription — PR #77
- T-088f: SystemStatusPanel self-subscription — PR #76
- T-088g: Extract workspace utilities — PR #78
- T-088h: RobotWorkspace slim-down — PR #80
- Controls panel overflow fix — PR #81
- T-074: Lint error sweep — PR #90
- T-087: Rename feature entry components to Page convention — PR #89
- T-101: Enable CBOR compression and throttle_rate on ROS subscriptions — PR #91
- T-094: GitHub repo metadata — gh repo edit (inline)
- T-069b: JSDoc sweep — features — PR #92
- T-102: Wire lastSeen timestamp — PR #93

- T-069a: JSDoc sweep — shared layers — PR #94
- T-105: Fake rosbridge server + integration tests (14 tests)
- T-106: Connection lifecycle tests (5 tests)
- T-100: Move utils tests to **tests**/ subfolder (already done, verified by ticket reviewer)
- T-110: Topic discovery auto-selection + hardcoded fallbacks — PR #102
- T-113: CBOR normalization centralized in useRosSubscriber — PR #102
- T-115: LiDAR display range default to 3m for indoor — PR #111
- T-103: TURN relay + bandwidth constraints for cellular WebRTC — PR #112
- T-077: Fix barrel file imports — PR #108
- T-092: README overhaul — PR #103
- T-093: Dead code + magic numbers sweep — PR #104 + dead-code-sweep
- T-107: Canvas content assertions — PR #106
- T-108: Performance regression guard — PR #107
- T-109: Multi-robot state isolation tests — PR #109
- T-091: Mobile LiDAR minimap visual alignment — PR #114
- T-098: Reconnect button on PilotStatusBar — PR #115
- T-118: Move pilot reconnect button into PilotControls — PR #117
- WebRTC stats instrumentation hook + pilot overlay — PR #121
- T-150: Convert non-finite CBOR values to null — PR #122
- T-151: Remove debug console.log from IMU hot path — PR #123
- T-152: Harden WebRTC reconnect (clear timer, guard double-fire, stabilize onStatusChange) — PR #123
- T-153: Empty hardcoded sensor topic defaults, rely on discovery auto-select — PR #123
- T-155: IMU quaternion schema nullable components — PR #123
- T-156: Battery schema nullable fields, clamp 0-100, unknown handling — PR #123
- T-161: Drop redundant rafThrottle in IMU + LiDAR hooks — PR #128
- T-162: WebRTC connect() step-context boundary logger — PR #129
- T-163: WebRTC reconnect-guard trace — PR #129
- T-164: Make BatteryStatus.voltage nullable (+ voltage resilience) — PR #130
- T-166: Battery both-null hook-layer test — PR #130
- T-165: Surface unknown IMU orientation instead of fake-level identity — PR #131
- T-104: Latest-wins message coalescing (low-bandwidth freeze) — PR #124
- T-160: Wire footer StatusBar to live connection state — PR #138
- T-167: Collapse IMU per-axis nullables into single orientation discriminator — PR #140

## In Progress

(none — Wave A bug-hunt tickets shipped; remaining bug-hunt work is in Backlog under "Bug Hunt 2026-05-29 — Wave B/C")

## Backlog

### Bug Hunt 2026-05-29 (remaining — Wave B/C)

Triage: `.planning/bug-hunt/00-triage.md`. Wave A tickets are under In Progress.

- T-154: Touch targets <44px (D-pad, E-STOP `size=sm`, header icon buttons). Wave B [VISUAL].
- H8 → **T-116** (extend): `touch-action`/`select-none` only on PilotHudMobile; desktop PilotHud/PilotControls (used ≥768px incl. touch tablets) still long-press zoom. Wave B [VISUAL].
- T-158: Audit other 14px inputs for iOS auto-zoom (font-size <16px). Wave B.
- T-159 (MOB-1): Add Robot modal mobile UX — inputs `text-sm`(14px)→16px to stop iOS auto-zoom; URL field needs `autoCapitalize="none"/autoCorrect="off"/spellCheck={false}`. `AddRobotModal.tsx:159,188`. Wave B [VISUAL].
- MOB-2 → **T-065a** (refine): controls scrollbar = workspace grid gutters too large + ControlsPanel internal spacing + container-query breakpoints firing inside 144-230px boxes. Desktop/tablet only; mobile PilotControls confirmed fine. Wave B [VISUAL].
- M3 = **T-114**: Add Robot test blocks submit up to 30s (3× back-to-back, 10s timeout each, no backoff). `AddRobotModal/helpers.ts:43-63`.
- M6 = **T-111**: RobotCard URL `truncate max-w-45`, no copy affordance. Wave B [VISUAL].

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

#### T-076: Pilot Mode CTA not visible without scrolling on 14" laptops

- Severity: MEDIUM
- Visual work — requires `/visual-pipeline` (discuss/research/approve)
- Scope: ControlsPanel, workspace layout, possibly sidebar
- Problem: On a MacBook Pro 14" (1512x982 logical), the workspace 3x2 grid fills the viewport. The "Enter Pilot Mode" button is below the fold inside the Controls panel — users must scroll within the panel to discover it. New users would not know Pilot Mode exists.
- Options to discuss:
  1. Move Pilot Mode CTA out of Controls panel entirely — into workspace header/breadcrumb or as a floating action button (always visible)
  2. Pin CTA at top of Controls panel with sticky positioning (visible without scroll)
  3. Add Pilot Mode entry point to sidebar robot list (right-click or inline icon)
  4. Compact Controls panel layout so CTA fits above the fold
- Quick win: reduce workspace grid gutter size (helps on 14" but doesn't solve the root discoverability issue)
- Acceptance: Pilot Mode entry point visible without scrolling on 14" MacBook (1512x982), discoverable for first-time users, build passes
- Branch: feat/t-076/pilot-mode-visibility

### Performance

### Bugs

#### T-168: AddRobot doubles a user-supplied /rosbridge path and reports it as a host/power failure

- Severity: MEDIUM
- Source: full E2E pass 2026-05-31 (finding F1), `.planning/uat-findings/2026-05-31-full-e2e.md`
- Scope: src/stores/connection/useConnectionStore.helpers.ts (deriveRosbridgeUrl), src/lib/rosbridge/ConnectionManager.ts (testConnection:178 / connect:81), src/features/fleet/components/AddRobotModal/ (error copy), src/features/fleet/helpers.ts (normalizeRosbridgeUrl)
- Problem: The connection URL is built in two layers — normalizeRosbridgeUrl sets protocol only (no path), then deriveRosbridgeUrl unconditionally appends `/rosbridge`. The app contract is "user enters the base host; the app derives /rosbridge (WS) + /webrtc (signaling)". If the user pastes the actual rosbridge endpoint (already ending in /rosbridge), deriveRosbridgeUrl produces `…/rosbridge/rosbridge` → WebSocket handshake 500 → modal shows "Failed after 3 attempts. Check the URL and ensure the robot is powered on." The error points at host/power, never reveals the doubled path, so the user cannot diagnose it. Confirmed live: base URL connects (19 topics); `/rosbridge` input fails.
- Fix candidates: (1) dedup in deriveRosbridgeUrl — strip a trailing `/rosbridge` (and `/webrtc`) before appending; (2) surface the resolved/derived URL in the modal error so the doubled path is visible; (3) field help text: "enter the base host — /rosbridge is added automatically".
- Acceptance: pasting a URL that already ends in /rosbridge connects successfully (no double-append); failed connection error reveals the resolved URL; unit test for deriveRosbridgeUrl dedup.
- Branch: fix/t-168/rosbridge-path-dedup

#### T-117: Generate visual regression baselines for canvas-content integration tests

- Severity: MEDIUM
- Scope: e2e/integration/canvas-content.spec.ts, e2e/integration/canvas-content.spec.ts-snapshots/
- Problem: T-107 shipped without committing chromium-linux baselines. Two tests skipped: lidar-with-data and imu-with-data. Visual regression hard-fails on first CI run with no baseline.
- Fix: Run tests in CI with `--update-snapshots`, download artifact, commit baselines under `e2e/integration/canvas-content.spec.ts-snapshots/`. Or run locally in Linux Docker matching CI env. Then remove `test.skip` and TODO comments.
- Branch: test/t-117/canvas-snapshot-baselines

#### T-116: Mobile pilot mode — unwanted zoom on button press-and-hold

- Severity: MEDIUM
- Scope: src/features/pilot/ — mobile HUD, velocity sliders, action buttons
- Problem: On mobile devices in pilot mode, press-and-holding buttons (e.g., velocity controls, zoom +/-) triggers the browser's native pinch-to-zoom or double-tap-to-zoom gesture, causing the viewport to zoom unexpectedly. This makes continuous control inputs unusable.
- Fix candidates:
  1. Add `touch-action: manipulation` to pilot mode container (disables double-tap zoom while keeping pan/scroll)
  2. Add `touch-action: none` on specific control buttons that support press-and-hold
  3. Prevent default on `touchstart`/`touchmove` for control elements
- Acceptance: press-and-hold on pilot mode controls does not trigger browser zoom, normal scrolling still works outside controls, works on iOS Safari and Chrome Android
- Branch: fix/t-116/mobile-pilot-zoom

#### T-111: Add copy-to-clipboard button for rosbridge URL on RobotCard

- Severity: LOW
- Visual work — requires `/visual-pipeline` (discuss/research/approve)
- Scope: src/features/fleet/components/RobotCard/components/RobotCardConnection.tsx, RobotCardDataRow
- Problem: The rosbridge URL is truncated with `truncate max-w-45` on the RobotCard. On smaller screens the URL is cut off and difficult to copy-paste.
- Fix: Add a small copy-to-clipboard icon button (shadcn Button, ghost/icon variant, Lucide `Copy` or `ClipboardCopy` icon) next to the URL value. On click, copy the full URL to clipboard. Show brief feedback (e.g., icon changes to `Check` for 1.5s). Consider also adding a tooltip on hover that shows the full URL.
- Acceptance: copy button visible next to URL, copies full URL on click, visual feedback on success, works on mobile (touch), build passes
- Branch: feat/t-111/url-copy-button

### Testing — Feature Coverage

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

### UX

#### T-114: Add Robot modal unresponsive during reconnection to failed connection

- Severity: MEDIUM
- Scope: src/features/fleet/components/AddRobotModal/AddRobotModal.tsx, helpers.ts, ConnectionToastProvider.tsx
- Problem: When the system is actively reconnecting to a failed robot, attempting to add a new robot feels blocked. The architecture is per-robot keyed (no global lock), but `testConnectionWithRetries()` blocks the modal submit for up to 9 seconds (3 attempts with exponential backoff: 2s → 4s → 8s). Combined with reconnection toasts firing for the failed robot, the UI appears frozen and unresponsive — users perceive they can't add robots while reconnection is active.
- Root cause: synchronous URL validation on submit blocks all modal interaction; overlapping toast notifications create confusion about which robot's status is being reported.
- Fix candidates:
  1. Move URL validation off the critical path — accept the form immediately, validate in background, show inline error if URL fails
  2. Reduce test timeout / attempt count (e.g., single 3s attempt instead of 3 × exponential)
  3. Show per-robot attribution on reconnection toasts so users can distinguish which robot is reconnecting
  4. Add a "skip validation" option for known-good URLs (e.g., previously connected robots)
  5. Disable reconnection attempts while AddRobotModal is open (debatable — may mask real issue)
- Acceptance: user can open AddRobotModal, fill form, and submit without perceived freeze while another robot is reconnecting; modal closes within 3 seconds on valid URL; toast notifications clearly attribute which robot they refer to
- Branch: fix/t-114/add-robot-during-reconnect

#### T-169: Deep-link / refresh into a robot view lands disconnected (opt-in reconnect-on-load)

- Severity: LOW (by-design UX enhancement, not a defect)
- Source: full E2E pass 2026-05-31 (finding F2), `.planning/uat-findings/2026-05-31-full-e2e.md`
- Scope: src/stores/connection/useConnectionStore.ts (persist merge / status reset), WorkspacePage / PilotPage load
- Problem: Zustand persist (key `rtd-connections`) rehydrates the robot record on load but resets `status` to `disconnected` and nulls lastSeen/reconnectAttempt — intentional, per CLAUDE.md "do NOT auto-connect on startup." Consequence: hard-navigating or refreshing `/robot/:id` or `/pilot/:id` renders disconnected (compass `---°`, gyro `---`, video idle) until the user clicks Reconnect. In-app client-side nav keeps the live socket; only full page loads drop it.
- Assessment: working as designed. Reconnect button restores the link + video. Filed only as a possible UX improvement.
- Fix candidates: (1) opt-in "reconnect on load" toggle (per-robot or global setting); (2) a one-click "Reconnect" affordance more prominent on the disconnected workspace/pilot view; (3) leave as-is and document the no-auto-connect behavior.
- Acceptance: if implemented — deep-linking into a previously-connected robot optionally re-establishes the connection without manual Reconnect, gated behind an explicit setting (no silent auto-dialing by default).
- Branch: feat/t-169/reconnect-on-load

### Documentation (run last — all paths finalized)

(none remaining)
