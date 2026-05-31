# Pilot — Feature Guide

## Overview

Pilot Mode is the immersive single-robot teleoperation view: a full-bleed
camera backdrop with translucent HUD instruments and drive controls layered on
top. It is the "get in the cockpit and drive one robot" surface, as opposed to
the multi-panel `workspace` dashboard.

- **Route:** `/pilot/:id` — registered in `src/App.tsx` (`<Route path="/pilot/:id" element={<PilotPage />} />`, lazy-loaded). Rendered **inside `AppShell`** (the sidebar/header chrome stays mounted).
- **Entry point:** `src/features/pilot/PilotPage.tsx` (`PilotPage`).
- **Reached from:**
  - Workspace `ControlsPanel` "Pilot Mode" button (`src/features/workspace/components/ControlsPanel/ControlsPanel.tsx:236` → `navigate(\`/pilot/${robotId}\`)`, `aria-label="Enter Pilot Mode"`).
  - Fleet `RobotCardActions` link (`src/features/fleet/components/RobotCard/components/RobotCardActions.tsx:53`).
  - Mobile workspace (`RobotWorkspaceMobile.tsx:49`).
  - The in-page "Dashboard" back link (desktop HUD) returns to `/robot/:id`.

Key data sources (all wired in `PilotPage.tsx`):

| Concern                                    | Hook                                                                | Source                                               |
| ------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------- |
| Robot record (url, status, selectedTopics) | `useConnectionStore((s) => s.robots[id])`                           | Zustand store, read-only                             |
| Connection (ros instance + connected flag) | `useRobotConnection(id)`                                            | store status + `connectionManager.getConnection(id)` |
| Reconnect action                           | `useConnectionStore((s) => s.connectRobot)`                         | store                                                |
| Drive commands                             | `useControlPublisher({ ros, topicName: selectedTopics?.controls })` | publishes `geometry_msgs/msg/Twist`                  |
| Orientation                                | `useImuSubscription(ros, selectedTopics?.imu)`                      | `sensor_msgs/msg/Imu`                                |
| LiDAR scan                                 | `useLidarSubscription(ros, selectedTopics?.lidar)`                  | `sensor_msgs/msg/LaserScan`                          |
| Battery                                    | `useBatterySubscription(ros, availableTopics)`                      | first discovered `sensor_msgs/msg/BatteryState`      |
| Topic discovery                            | `useRosTopics(ros)`                                                 | rosbridge topic list                                 |
| Camera video + RTC peer                    | `useWebRtcStream({ connected, enabled: !!robot, url })`             | WebRTC signaling to robot                            |
| Live stream stats                          | `useWebRtcStats(pc)` (inside `WebRtcStatsOverlay`)                  | `RTCPeerConnection.getStats()`                       |
| Fullscreen                                 | `usePilotFullscreen()`                                              | local state + `f`/`Escape` keys                      |
| Viewport split                             | `useIsMobile()`                                                     | `< 768px` → mobile HUD                               |

The page assembles a single `telemetry` object (a `useMemo` keyed on
`connected`, `imu.orientation`, lidar points, `lidar.rangeMax`, and `battery`)
and passes it to either `PilotHud` (desktop) or `PilotHudMobile` (mobile).
Crucially, `imu` is gated by connection: `imu: connected ? imu.orientation : null`
(`PilotPage.tsx:72`), so a stale orientation never lingers after disconnect.

## Flow map

```
Workspace ControlsPanel "Pilot Mode"  ─┐
Fleet RobotCardActions pilot link      ─┼──► /pilot/:id  (PilotPage)
RobotWorkspaceMobile navigate          ─┘
                                            │
              ┌─────────────────────────────┴─────────────────────────────┐
              │ robot exists in store?                                     │
              │   NO  ──► PilotNotFound ("Robot not found: <id>")          │
              │           → "Back to Fleet" link → /fleet                  │
              │   YES ──► render camera backdrop + HUD overlay             │
              └─────────────────────────────┬─────────────────────────────┘
                                            │
        useWebRtcStream attempts video ─────┤   (idle → connecting → streaming;
                                            │    failed/disconnected → reconnecting → failed)
                                            │
              ┌──────── isMobile? ──────────┴───────────┐
              │ NO → PilotHud (desktop)                 │ YES → PilotHudMobile
              │   LiDAR top-left                        │   Compass strip + status/gyro row top
              │   Compass top-center                    │   LiDAR bottom-left
              │   Fullscreen + StatusBar top-right      │   Controls bottom-right
              │   Gyro + Dashboard link bottom-left     │   (no fullscreen, no back link —
              │   Controls bottom-right                 │    nav via app shell sidebar)
              └──────────────────┬──────────────────────┘
                                 │
   Drive: D-pad press/hold or arrow keys → cmd_vel Twist @ 10 Hz
          velocity sliders set magnitude (LIN m/s, ANG rad/s)
          E-STOP / release / "stop" / Escape (non-fullscreen) → ZERO_TWIST
                                 │
   Fullscreen toggle (button or `f`) → fixed inset-0 z-50; `Escape` exits
                                 │
   Disconnected → controls disabled + "Reconnect" button → connectRobot(id)
                                 │
   Exit (Dashboard link / sidebar nav / unmount) → useControlPublisher cleanup
          publishes ZERO_TWIST before tearing down the Topic
```

Branches:

- **Not-found:** `id` missing from `store.robots` → `PilotNotFound` (no camera, no HUD).
- **Disconnected:** robot exists but `status !== 'connected'` → HUD renders, controls disabled, compass/gyro dim to loss-of-fix, video idles.
- **Orientation unknown / loss-of-fix:** connected but IMU `orientation` is `null` (sensor reported NaN/unknown, T-165/T-167) → compass freezes + dims with `---°`, gyro rows show `---`.

## Segments

### Camera / video backdrop (`PilotCamera`)

- **Responsibilities:** Full-bleed FPV background. Shows the live `<video>` when the stream is up; otherwise a `CameraEmptyState` (hero variant) with a status message.
- **Available actions:** None directly (passive backdrop). Video is `autoPlay playsInline muted`, `object-cover`.
- **State / data sources:** `useWebRtcStream({ connected, enabled: !!robot, url: robot.url })` returns `{ pc, status, videoRef }`. `videoStatus === 'streaming'` swaps the empty state for `<video ref={videoRef}>`. Status labels come from `VIDEO_STATUS_LABELS` (`constants.ts`): `connecting → "Connecting..."`, `failed → "Stream failed"`, `idle → "No video stream"`, `reconnecting → "Reconnecting..."`. WebRTC URL is derived from `robot.url` via `deriveWebRtcUrl`.
- **Connected vs disconnected:** Stream only attempts when `enabled && connected && url` are all truthy. On disconnect the effect tears down the peer connection and resets status to `idle` ("No video stream"). Auto-reconnect with exponential backoff up to `RECONNECT_MAX_ATTEMPTS`, then `failed` ("Stream failed"). Orientation has no effect here.

### Compass (`PilotCompass` desktop / `PilotCompassMobile` mobile)

- **Responsibilities:** Horizontal heading strip (Canvas 2D) — ticks slide with yaw; major ticks every 30°, minor every 10°; cardinal labels N/E/S/W; center pointer triangle; gradient fade at edges.
- **Available actions:** None (read-only instrument).
- **State / data sources:** `heading = telemetry.imu?.yaw ?? null`. Desktop draws a numeric readout below the strip (`123°`). Mobile normalizes via `normalizeHeading(yaw)` and renders a full-width ODST-style strip.
- **Connected vs disconnected / loss-of-fix:** When `heading === null` (disconnected → `telemetry.imu` is null, OR connected-but-orientation-unknown) the strip is **frozen, dimmed to `opacity-40`**, and the readout shows `---°`. `aria-label` becomes "Heading unknown — no orientation data". This is deliberate: no confidently-wrong North is shown (`PilotCompass.tsx:28-29`).

### Gyro readout (`PilotGyroReadout` desktop / `GyroInline` mobile)

- **Responsibilities:** Roll / pitch / yaw orientation values.
- **Available actions:** None (read-only).
- **State / data sources:** Desktop `PilotGyroReadout` renders a `<dl>` with `GyroRow` per axis (PITCH/ROLL/YAW), values via `formatDegrees`. Mobile `GyroInline` packs `R: / P: / Y:` into the status row.
- **Connected vs disconnected / orientation-unknown:** Each axis is `orientation?.pitch ?? null`; a `null` value (disconnected or unknown orientation) renders `---`. Because `PilotPage` nulls `imu` when not connected, all three axes show `---` while disconnected.

### LiDAR minimap (`PilotLidarMinimap`)

- **Responsibilities:** Circular top-down radar (Canvas 2D) — dashed cross-hair grid, distance labels, edge ticks, distance-colored scan points with phosphor glow, robot triangle at center.
- **Available actions:** **Zoom** via mouse wheel (`onWheel`) and `+` / `-` buttons (`aria-label="Zoom in"` / `"Zoom out"`); current zoom shown as `1.0x`. Zoom range/step from `PILOT_ZOOM_MIN/MAX/STEP`.
- **State / data sources:** `points` = `telemetry.lidarPoints` (Cartesian: `PilotPage` converts polar `{angle, distance}` → `{x: cos·d, y: sin·d}`). `rangeMax` = `telemetry.lidarRangeMax`. `heading` = compass heading, or `0` when heading is null. Point color buckets by distance ratio (critical/caution/nominal).
- **Connected vs disconnected / loss-of-fix:** Disconnected → no scan messages → empty point set, grid still drawn. On loss-of-fix the minimap falls back to robot-frame `heading = 0` (honest robot-relative frame, not a fake world heading — `PilotHud.tsx:55-57`).

### Status bar (`PilotStatusBar` desktop; inline row on mobile)

- **Responsibilities:** Battery level + dual link health (ROS control link vs WebRTC video link).
- **Available actions:** None (read-only).
- **State / data sources:** Desktop `PilotStatusBar` → `BatteryRow` (percentage bar + `getBatteryColor`) and two `ConnectionRow`s: `ROS` (`rosbridgeStatus === 'connected'`) and `VIDEO` (`videoStatus === 'streaming'`), each shows `OK`/`OFF` with a pulsing dot. Mobile uses `StatusDot` ("ROS"/"VID") plus a battery percent and `GyroInline`.
- **Connected vs disconnected:** `rosbridgeStatus` is `connected ? 'connected' : 'disconnected'` (`PilotPage.tsx:85`). Disconnected → ROS dot red/`OFF`. Video dot is independent: it can be `OFF` even when ROS is `OK` (separate transports). Battery shows `--` / `0%` bar when `null`.

### Controls — D-pad + E-STOP + velocity sliders (`PilotControls`, `EStopButton`, `DpadButton`, `VelocitySlider`)

- **Responsibilities:** The drive cluster. Reuses shared `DpadButton` + `VelocitySlider` driven by `useControlPublisher`.
- **Available actions:**
  - **D-pad** (`DpadButton`): `Move forward` (ChevronUp), `Move backward` (ChevronDown), `Turn left` (ChevronLeft), `Turn right` (ChevronRight), `Stop` (Square, center). Press-and-hold (`onPointerDown` → start, `onPointerUp`/`onPointerLeave` → end).
  - **Keyboard** (panel-scoped, `tabIndex=0`): `ArrowUp/Down/Left/Right` map to forward/backward/left/right (`KEY_TO_DIRECTION`); keydown starts, keyup ends. `Escape` triggers **emergency stop** — but only when NOT fullscreen (in fullscreen, `Escape` is reserved for exiting fullscreen).
  - **E-STOP** (`EStopButton`, `aria-label="Emergency stop"`): danger button, calls `onEmergencyStop` (= `handleDirectionEnd`).
  - **Velocity sliders** (`VelocitySlider`): `LIN` (m/s, min 0 / max 1.0 / default 0.15 / step 0.01) and `ANG` (rad/s, min 0 / max 2.0 / default 0.39 / step 0.01) from `VELOCITY_LIMITS`. These set the magnitude, not direction.
  - **Reconnect** button: only rendered when `!connected && onReconnect` is provided; placed above E-STOP.
- **State / data sources — what control publishes:** `useControlPublisher` publishes `geometry_msgs/msg/Twist` to `selectedTopics?.controls` (defaults to `/cmd_vel`) at `DEFAULT_PUBLISH_RATE = 10` Hz while a direction is held (`setInterval` every 100 ms). `buildTwist` maps:
  - `forward` → `linear.x = +linearVelocity`
  - `backward` → `linear.x = -linearVelocity`
  - `left` → `angular.z = +angularVelocity`
  - `right` → `angular.z = -angularVelocity`
  - `stop` / release / E-STOP → `ZERO_TWIST` (`{linear:{0,0,0}, angular:{0,0,0}}`). No CBOR/throttle on the publisher Topic — commands go out raw for low latency.
- **Connected vs disconnected:** `disabled = !connected`. All D-pad buttons, both sliders, and E-STOP are disabled when disconnected; the Reconnect button appears instead and calls `connectRobot(id)`.

### WebRTC stats overlay (`WebRtcStatsOverlay`)

- **Responsibilities:** Debug-only diagnostics panel (fixed top-right, `z-50`) showing live stream quality.
- **Available actions:** `Copy` button (`aria-label="Copy stats snapshot to clipboard"`) writes a JSON snapshot (`buildStatsSnapshot`, labeled `local`/`cloud` via `detectDeployment`) to the clipboard; toggles to "Copied" for 1.5 s.
- **State / data sources:** `useWebRtcStats(pc)` polls `RTCPeerConnection.getStats()` every 1000 ms. Rows: FPS, Res, kbps, **RTT (ms)**, Jitter, Dropped, Decoded, Loss, State. Shows "Waiting for stats…" until the first poll.
- **Visibility gate:** Mounts only when `isStatsOverlayEnabled()` is true — `import.meta.env.DEV`, OR `localStorage['webrtc-stats-debug'] === '1'` in production. In a normal production build it renders `null`.
- **Connected vs disconnected:** `pc` is `null` when no stream → `useWebRtcStats` clears state, overlay shows "Waiting for stats…".

### Fullscreen (`PilotFullscreenToggle` + `usePilotFullscreen`) — desktop only

- **Responsibilities:** Expand the pilot view to a `fixed inset-0 z-50` (`PILOT_FULLSCREEN_Z`) layer.
- **Available actions:** Toggle button top-right (`Maximize2`/`Minimize2`, `aria-label="Fullscreen (F)"` / "Exit fullscreen (F)"). Keyboard: press `f`/`F` to toggle (ignored while typing in inputs/textarea/contenteditable); `Escape` exits fullscreen (and takes priority over E-STOP, see Controls).
- **State / data sources:** `usePilotFullscreen()` → `{ isFullscreen, toggleFullscreen, exitFullscreen }`, local React state with a capture-phase `keydown` listener.
- **Connected vs disconnected:** Independent of connection. Not rendered on mobile (`PilotHudMobile` has no fullscreen toggle — navigation is via the app shell sidebar).

### Mobile HUD (`PilotHudMobile`)

- **Responsibilities:** Compact mobile layout consumed when `useIsMobile()` (viewport `< 768px`). Full-width compass strip across the top, a unified status+gyro row beneath it, LiDAR minimap bottom-left (capped at `MINIMAP_SIZE_MOBILE_MAX`), controls bottom-right.
- **Available actions:** Same D-pad / sliders / E-STOP / Reconnect as desktop. No fullscreen toggle, no Dashboard back link.
- **State / data sources:** Same hooks/telemetry as desktop. Heading normalized via `normalizeHeading`. Battery percent + ROS/VID `StatusDot`s in the top row.
- **Touch behavior (T-116 / T-090):** Root overlay is `pointer-events-none select-none` with `touchAction: 'manipulation'` and respects `env(safe-area-inset-*)`. `onContextMenu` preventDefault suppresses the long-press context menu / callout. The controls wrapper is `touch-none` so press-and-hold driving does not trigger touch-scroll or pinch/double-tap zoom. The page root sets `overscrollBehavior: 'contain'`.
- **Connected vs disconnected / loss-of-fix:** Identical semantics to desktop — disabled controls + Reconnect; compass dims and minimap falls back to robot-frame on null heading.

### Pilot not-found (`PilotNotFound`)

- **Responsibilities:** Empty state when `/pilot/:id` resolves to an `id` absent from the connection store.
- **Available actions:** "Back to Fleet" link → `/fleet`.
- **State / data sources:** Pure render of `robotId` from the URL; renders before any subscription/video is attempted (`PilotPage.tsx:81-83`, returns early).
- **Connected vs disconnected:** N/A — there is no robot to connect to. Shows "Robot not found: <id>".

## Manual test cases

> Use the live robot URL `wss://<your-robot-host>/rosbridge` when adding the robot. Add it from Fleet, connect, then enter Pilot Mode. Run `npm run dev` on desktop (≥ 1280px) unless a case says mobile.

### Happy path

- **TC-01 — Enter Pilot for a connected robot.** Add a robot with url `wss://<your-robot-host>/rosbridge`, connect it (status `connected`), open its workspace, click **Pilot Mode** in `ControlsPanel`. Expect: navigate to `/pilot/:id`, camera backdrop renders, HUD overlays mount, no `PilotNotFound`.
- **TC-02 — Video stream.** Within a few seconds the camera empty state ("Connecting...") is replaced by the live `<video>` (full-bleed, object-cover). Status bar `VIDEO` dot turns `OK`/green.
- **TC-03 — Compass + heading.** Compass strip shows ticks sliding with robot yaw and a numeric `NNN°` readout (not `---°`). Rotate the robot → strip and readout track.
- **TC-04 — Gyro readout.** `PilotGyroReadout` (bottom-left) shows numeric PITCH/ROLL/YAW (not `---`); values change as the robot moves.
- **TC-05 — LiDAR minimap.** Top-left circular minimap shows colored scan points + center robot triangle. Click `+` / `-` (and mouse-wheel over the canvas) → zoom value (`1.0x` …) updates and point spread scales.
- **TC-06 — Battery.** Status bar `BAT` row shows a non-`--` percentage with a colored bar.
- **TC-07 — ROS link health.** Status bar `ROS` row shows `OK`/green dot.
- **TC-08 — Drive forward (D-pad).** Open devtools network/console (or the stats overlay isn't enough here — watch the robot or a `cmd_vel` echo). Press-and-hold the forward (▲) D-pad button. Expect a `geometry_msgs/msg/Twist` published on the controls topic (default `/cmd_vel`) at ~10 Hz with `linear.x = +0.15` (default LIN). Release → a single `ZERO_TWIST` (`linear.x = 0`).
- **TC-09 — Turn left/right.** Hold ◀ → Twist `angular.z = +0.39`; hold ▶ → `angular.z = -0.39` (default ANG). Release each → `ZERO_TWIST`.
- **TC-10 — Drive via arrow keys.** Click the controls panel to focus it, hold `ArrowUp` → continuous forward Twist; release → stop. Verify `ArrowDown/Left/Right` map to backward/left/right.
- **TC-11 — Adjust velocity sliders.** Drag `LIN` to e.g. 0.50 m/s and `ANG` to 1.00 rad/s (readouts update). Re-drive forward/turn → published `linear.x` / `angular.z` magnitudes now match the new slider values.
- **TC-12 — E-STOP.** While idle (or moving), click **E-STOP**. Expect an immediate `ZERO_TWIST` publish and motion stops.
- **TC-13 — Fullscreen toggle.** Click the top-right Fullscreen button (or press `f`). View expands to `fixed inset-0 z-50`. Press `Escape` (or click Exit) → returns to inline. Confirm `Escape` exited fullscreen rather than firing E-STOP.
- **TC-14 — WebRTC stats overlay.** In `npm run dev` (DEV build), confirm the top-right "WebRTC Stats" panel shows FPS / Res / kbps / **RTT** / Jitter / State once streaming. Click **Copy** → "Copied" appears; paste clipboard → JSON snapshot with `deployment: "cloud"` (trycloudflare URL), `rtt_ms`, `duration_seconds`.
- **TC-15 — Return to dashboard.** Click the bottom-left **Dashboard** link → navigates to `/robot/:id`. (Per TC-22, this also publishes ZERO_TWIST on unmount.)

### Edge cases

- **TC-E01 — Invalid robot id (PilotNotFound).** Navigate directly to `/pilot/does-not-exist`. Expect `PilotNotFound`: "Robot not found: does-not-exist" + "Back to Fleet" link → `/fleet`. No camera/HUD mount.
- **TC-E02 — Disconnected robot.** Add the robot but do NOT connect (or disconnect it), then enter Pilot. Expect: HUD renders, `ROS`/`VIDEO` dots red/`OFF`, D-pad + sliders + E-STOP disabled, **Reconnect** button visible above E-STOP.
- **TC-E03 — Loss-of-fix on disconnect.** While disconnected (TC-E02): compass is dimmed (`opacity-40`) and reads `---°`; gyro rows all read `---`; minimap shows only the grid + robot triangle (robot-frame, heading 0).
- **TC-E04 — Orientation unknown while connected.** Connect to a robot whose IMU reports unknown orientation (NaN/null quaternion → `orientation: null`, T-165/T-167). Expect compass dimmed `---°` and gyro `---` **even though** `ROS` shows `OK` and video may be streaming. Confirms compass null-heading path is orientation-driven, not connection-driven.
- **TC-E05 — No video stream.** Connect to a robot with no camera/WebRTC endpoint. Expect camera area shows `CameraEmptyState` "No video stream" (idle) or "Stream failed"; `VIDEO` dot `OFF` while `ROS` is `OK`. Drive controls still work (TC-08 still publishes).
- **TC-E06 — WebRTC failed / auto-reconnect.** Kill the video source mid-stream. Expect status → "Reconnecting..." (backoff retries), then "Stream failed" after `RECONNECT_MAX_ATTEMPTS`. `VIDEO` dot goes `OFF`. ROS control link unaffected (separate transport).
- **TC-E07 — Reconnect button.** From TC-E02, click **Reconnect**. Expect `connectRobot(id)` runs; on success the ROS dot flips to `OK`, controls enable, video re-attempts.
- **TC-E08 — Mobile HUD layout (< 768px).** Resize to 375×812 (or device emulation). Expect `PilotHudMobile`: full-width compass strip top, status+gyro row, minimap bottom-left, controls bottom-right; NO fullscreen button, NO Dashboard back link.
- **TC-E09 — Mobile touch press-hold zoom suppression (T-116/T-090).** On a touch device/emulator, press-and-hold a D-pad button to drive. Expect NO long-press context menu/callout, NO pinch/double-tap zoom, NO page scroll while driving (root `select-none` + `touchAction: 'manipulation'`, `onContextMenu` prevented, controls `touch-none`, `overscrollBehavior: contain`). Verify continuous Twist publishing throughout the hold.
- **TC-E10 — E-STOP while moving.** Hold forward (Twist streaming), then click E-STOP without releasing. Expect immediate `ZERO_TWIST` and the active-direction highlight clears.
- **TC-E11 — Button press-hold continuous publish.** Hold any direction for ~3 s. Expect repeated identical Twist messages at ~10 Hz for the whole hold (not a single message), and exactly one `ZERO_TWIST` on release.
- **TC-E12 — Escape priority in fullscreen.** Enter fullscreen, then press `Escape`. Expect fullscreen exits and E-STOP does NOT fire. Press `Escape` again while NOT fullscreen (controls focused) → E-STOP fires (`ZERO_TWIST`).
- **TC-E13 — Leaving pilot publishes ZERO_TWIST.** Start driving forward, then navigate away (Dashboard link, sidebar, or browser back) while still "moving." Expect `useControlPublisher` cleanup publishes `ZERO_TWIST` before the Topic is torn down — the robot must not keep moving after you leave.
