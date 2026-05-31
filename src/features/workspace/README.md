# Workspace — Feature Guide

## Overview

The Workspace is the single-robot operations view: a six-panel grid that streams
live telemetry, video, and control for one robot. It is rendered by
`WorkspacePage` (`src/features/workspace/WorkspacePage.tsx`) at the route
`/robot/:id`, registered in `src/App.tsx` and wrapped in `AppShell`. It is reached
from a fleet `RobotCard` "VIEW" action or by selecting a robot in the sidebar.

Key data sources:

- **Connection store** — `useConnectionStore` (`src/stores/connection/useConnectionStore.ts`).
  Holds the `robots` map keyed by id; each `RobotConnection` carries `status`,
  `url`, `lastSeen`, `color`, and `selectedTopics` (per-panel topic names). WebSocket
  lifecycle is delegated to `connectionManager`, not the store.
- **`useRobotConnection(id)`** (`src/hooks/useRobotConnection`) — returns
  `{ robot, connected, ros, connect, disconnect }`. `connected` is
  `robot.status === 'connected'`; `ros` is `connectionManager.getConnection(id)`.
- **`useTopicManager(id, ros)`** (`./hooks/useTopicManager.ts`) — discovers topics via
  `useRosTopics`, filters them per panel by ROS message type (`PANEL_TOPIC_TYPES` in
  `./constants.ts`), exposes `selectedTopics` and `setTopic`, and auto-selects the
  first valid topic per panel on every discovery poll (correcting stale persisted names).
- **`useMinimizedPanels(WORKSPACE_PANEL_IDS)`** (`./hooks/useMinimizedPanels.ts`) —
  minimize / maximize / restore-all state for the six panels.
- **`useIsMobile()`** — viewport `< 768px` switches the whole page to
  `RobotWorkspaceMobile`.

**Panels-own-subscriptions architecture.** `WorkspacePage` is a layout orchestrator.
It does not subscribe to any ROS data. Each panel receives `ros` + `connected`
(+ `topicName` where applicable) and calls its own subscription hook internally
(`useLidarSubscription`, `useImuSubscription`, `useBatterySubscription`,
`useControlPublisher`, `useWebRtcStream`, `useTelemetrySubscription`,
`useRosGraph`, `useRosTopics`). There is no React Context and no prop relay of
message data. `WorkspacePanel` wraps each panel body in a `PanelErrorBoundary`.

## Flow map

```
Fleet RobotCard "VIEW" / sidebar
        │
        ▼
  /robot/:id  ──►  WorkspacePage
        │
        ├─ robot not in store ─────────────► WorkspaceNotFound ("Robot not found: <id>", Back to Fleet)
        │
        ├─ useIsMobile (< 768px) ──────────► RobotWorkspaceMobile (single panel + bottom MobileTabBar)
        │
        └─ desktop ────────────────────────► 3×2 panel grid (WorkspacePanel × 6)
                 │
                 ├─ connected (robot.status === 'connected', ros defined)
                 │     • each panel self-subscribes and streams live data
                 │     • topic discovery polls every 10s; auto-selects first valid topic per panel
                 │     • select a topic via the per-panel TopicSelector dropdown in the header
                 │     • minimize a panel  → MinimizedPanelBar button appears, grid reflows (cols = min(visible,3))
                 │     • maximize a panel  → that panel fills a 1×1 grid; others minimized; Restore-all button
                 │     • restore           → panel returns to grid
                 │     • ControlsPanel D-pad / sliders / arrow keys → publishes geometry_msgs/msg/Twist to cmd_vel
                 │     • Controls / mobile Pilot tab → navigate to /pilot/:id
                 │
                 └─ disconnected (status !== 'connected', ros undefined)
                       • CameraPanel → CameraEmptyState "Disconnected"
                       • Lidar / IMU / Telemetry → muted (opacity-50), empty / OrientationUnknown
                       • Controls → disabled, status "DISCONNECTED"
                       • SystemStatus → "Connect" button (calls connect())
        │
        ▼
  Back to Fleet (sidebar / browser nav)
```

## Segments

### Workspace grid (desktop)

- **Responsibilities** — Lays the six panels into an explicit responsive CSS grid.
  Computes `visibleCount = 6 − minimizedIds.size`, `cols = maximizedId ? 1 : min(visibleCount, 3)`,
  `rows = maximizedId ? 1 : ceil(visibleCount / cols)`. Grid column class comes from
  `GRID_COL_MAP` (static strings to survive Tailwind purge); rows are `grid-rows-1`
  or `grid-rows-2`.
- **Available actions** — None directly; it renders the six `WorkspacePanel`
  wrappers (Camera, LiDAR, System Status, IMU Attitude, Controls, Telemetry) and
  the `MinimizedPanelBar` below.
- **State / data sources** — `useMinimizedPanels`, `useTopicManager`,
  `useRobotConnection`. Panel order/ids from `WORKSPACE_PANEL_META` /
  `WORKSPACE_PANEL_IDS` in `./constants.ts`.
- **Connected vs disconnected** — Layout is identical in both states; only the
  panel bodies change (each panel handles its own muted/empty rendering).

### WorkspacePanel (shell wrapper)

- **Responsibilities** — Reusable `<article>` container with a header (icon +
  uppercase label + optional `TopicSelector`) and a scrollable body
  (`flex-1 p-4 min-h-0 overflow-auto`) wrapping the panel in `PanelErrorBoundary`.
- **Available actions** — `Minimize panel` (Minus, only when `onMinimize` set and
  not maximized), `Maximize panel` (Maximize2) / `Restore all panels` (Minimize2)
  toggle, plus the in-header `TopicSelector` when `topicName` is provided.
- **State / data sources** — Pure props (`WorkspacePanel.types.ts`); renders
  `Component` with `componentProps`. No ROS subscription of its own.
- **Connected vs disconnected** — Header controls always available; body content
  follows the wrapped panel.

### Camera panel

- **Responsibilities** — Camera feed via self-managed WebRTC stream
  (`CameraPanel.tsx`). Shows a `<video autoPlay playsInline muted>` element.
- **Available actions** — None (display only; no topic selector — `componentProps`
  pass no `topicName`).
- **State / data sources** — `useWebRtcStream({ connected, enabled: connected, url: robotUrl })`.
  Video is **not** delivered over a ROS topic; it uses WebRTC signaling derived
  from `robot.url`. `PANEL_TOPIC_TYPES.camera` lists `sensor_msgs/msg/CompressedImage`
  / `sensor_msgs/msg/Image` but is annotated "NOT used since webrtc".
- **Connected vs disconnected** — Connected: video element streams. Disconnected:
  renders `CameraEmptyState` with `message="Disconnected"`; aria-label switches to
  "Camera feed — no stream".

### LiDAR panel

- **Responsibilities** — Top-down 2D tactical scan display on Canvas 2D
  (`LidarPanel.tsx`). Points colored by distance (close → critical, mid → caution,
  far → nominal), robot triangle at center, Cartesian grid, crosshair, range circles
  at 50% / 100% of `rangeMax` (`LIDAR_DISPLAY_RANGE = 3` m). Footer shows `PTS`
  (point count) and `RANGE`.
- **Available actions** — Zoom in / Zoom out buttons and mouse-wheel zoom
  (`useZoom`, 0.5×–4×, step 0.2). Header `TopicSelector` for the LaserScan topic.
- **State / data sources** — `useLidarSubscription(ros, topicName)` →
  subscribes to **`sensor_msgs/msg/LaserScan`** (`coalesce: true`, `throttleRate: 200`).
  Parses valid ranges into polar `LidarPoint[]`. Topic from `selectedTopics.lidar`,
  filtered list from `filteredTopics.lidar`.
- **Connected vs disconnected** — Disconnected: wrapper gets `opacity-50` and scan
  points are not drawn (the `if (connected)` guard), though grid/crosshair/robot
  still render.

### System Status panel

- **Responsibilities** — Robot identity and health summary (`SystemStatusPanel.tsx`):
  name, status dot + label, URL, connect/disconnect button, UPTIME, BATTERY,
  LAST SEEN, and expandable ROS graph rows (NODES / TOPICS / SERVICES / ACTIONS).
- **Available actions** — `Connect` / `Disconnect` button (label + icon from
  `CONNECTION_BUTTON`; disabled while `connecting`, spinner icon). Expand/collapse
  each graph row (`ExpandableRow` → `ExpandableRowList`, accordion: one open at a time).
- **State / data sources** — No header topic selector (`filteredTopics.status` is
  always `[]`). Reads `robot` from the store; `useBatterySubscription(ros, availableTopics)`
  auto-finds the first **`sensor_msgs/msg/BatteryState`** topic (`throttleRate: 1000`);
  `useRosGraph(ros)` polls nodes/topics/services/actions every 10s; `useRosTopics(ros)`;
  `useConnectionUptime(robot.id, connected)`. Status display strings from
  `STATUS_DISPLAY` (connected→NOMINAL, connecting→CAUTION, disconnected/error→OFFLINE).
- **Connected vs disconnected** — UPTIME and BATTERY rows render only when
  `connected`. LAST SEEN and the graph rows always render (counts default to 0 /
  empty when no data). Battery null handling (T-164): `battery.percentage` shows
  `—` when null; `getBatteryColor(null)` is used; voltage / percentage are dropped
  when NaN / negative (a real 0 is preserved).

### IMU Attitude panel

- **Responsibilities** — Attitude visualization in one of four modes
  (`ImuPanel.tsx`): `attitude-compass` (ATT+CMP, default), `numbers` (NUM),
  `attitude` (ATT), `3d` (3D wireframe). Mode list from `IMU_VIZ_OPTIONS`; views
  mapped in `VARIANT_VIEWS`.
- **Available actions** — `MODE:` dropdown (`ImuVizSelect`) to switch visualization;
  header `TopicSelector` for the IMU topic.
- **State / data sources** — `useImuSubscription(ros, topicName)` → subscribes to
  **`sensor_msgs/msg/Imu`** (`coalesce: true`, `throttleRate: 100`). Converts the
  orientation quaternion to Euler (roll/pitch/yaw) via `quaternionToEuler`. Topic
  from `selectedTopics.imu`, list from `filteredTopics.imu`.
- **Connected vs disconnected** — Always rendered; disconnected applies
  `opacity-50`. Orientation handling (T-165 / T-167): the schema returns `null`
  for orientation when the quaternion is null or any of w/x/y/z is null
  (all-or-none, never coerced to identity). When `orientation` is null the panel
  renders `OrientationUnknown` ("Orientation unknown / IMU is not reporting
  orientation data") instead of a confidently-wrong level horizon.

### Controls panel

- **Responsibilities** — Drive controls (`ControlsPanel.tsx`): E-STOP, a 3×3 D-pad
  (forward / backward / left / right / stop), LINEAR and ANGULAR velocity sliders,
  a live status indicator (DISCONNECTED / STOPPED / ACTIVE), and a Pilot Mode button.
- **Available actions** — `Emergency stop` (E-STOP button or Escape key); D-pad
  press-and-hold (`DpadButton`) or arrow keys (`KEY_TO_DIRECTION`); `LINEAR` slider
  (0–1.0 m/s, default 0.15) and `ANGULAR` slider (0–2.0 rad/s, default 0.39) from
  `VELOCITY_LIMITS`; `Enter Pilot Mode` → navigates to `/pilot/:robotId`.
- **State / data sources** — `useControlPublisher({ ros, topicName })` **publishes**
  **`geometry_msgs/msg/Twist`** to the controls topic. Default topic `/cmd_vel`
  (`DEFAULT_PANEL_TOPICS.controls`); a press starts an interval publishing the built
  Twist at the publish rate, release / stop / unmount publishes `ZERO_TWIST`. The
  publisher Topic uses no CBOR compression and no `throttle_rate` (commands must
  arrive immediately). Topic from `selectedTopics.controls`, list from
  `filteredTopics.controls`.
- **Connected vs disconnected** — `disabled = !connected` disables E-STOP, D-pad,
  and sliders. Status row: `DISCONNECTED` (red) when `!connected`; `STOPPED`
  (offline) when connected and idle; `ACTIVE` (nominal, pulsing) while a direction
  is held.

### Telemetry panel

- **Responsibilities** — Canvas 2D time-series line chart (`TelemetryPanel.tsx`).
  Plots numeric fields extracted from the selected topic over a 30s window
  (`TELEMETRY_TIME_WINDOW_MS`), with per-series colored polylines, auto-scaled value
  axis, relative time axis, and a legend.
- **Available actions** — Header `TopicSelector` to pick which topic to plot.
- **State / data sources** — `useRosTopics(ros)` resolves the selected topic's type
  (default `nav_msgs/msg/Odometry`), then `useTelemetrySubscription(ros, topicName, topicType)`
  (`throttleRate: 100`, `coalesce: false` — every sample recorded, flushed once per
  RAF). `parseMessage` extracts plottable fields per type. Supported telemetry types
  (`PANEL_TOPIC_TYPES.telemetry`): **`nav_msgs/msg/Odometry`** (Linear/Angular),
  **`geometry_msgs/msg/Twist`** (Linear X / Angular Z), **`sensor_msgs/msg/Imu`**
  (angular velocity + linear acceleration components), **`sensor_msgs/msg/BatteryState`**
  (Voltage / Percentage), **`sensor_msgs/msg/LaserScan`** (Min / Avg range). Topic
  from `selectedTopics.telemetry`, list from `filteredTopics.telemetry`.
- **Connected vs disconnected** — Disconnected applies `opacity-50`; with no data
  the grid renders with no series lines.

### Topic selector

- **Responsibilities** — Dropdown in a panel header (`TopicSelector.tsx`) showing
  the current topic name and a menu of discovered topics (name + type) for that panel.
- **Available actions** — Open the dropdown ("Select topic"); pick a topic → calls
  `onTopicChange(topic.name)` → `setTopic(panelId, name)` → `setRobotTopic` in the store.
- **State / data sources** — Props: `topicName`, `availableTopics`
  (`filteredTopics[panel]`), `onTopicChange`. Renders `null` when there are no
  topics or no `onTopicChange` (so Camera and System Status never show it).
- **Connected vs disconnected** — Only meaningful when connected (discovery returns
  topics). Disconnected → no discovered topics → dropdown hidden.

### Minimized bar

- **Responsibilities** — Horizontal bar (`MinimizedPanelBar.tsx`) of restore buttons
  for currently minimized panels, rendered below the grid.
- **Available actions** — Click a panel button (icon + label from
  `WORKSPACE_PANEL_META`) → `onRestore(id)` → `restore(id)`.
- **State / data sources** — `minimizedIds` set and `isMinimized` from
  `useMinimizedPanels`. Returns `null` when nothing is minimized.
- **Connected vs disconnected** — Independent of connection state.

### Mobile workspace / tab bar

- **Responsibilities** — At `< 768px`, `RobotWorkspaceMobile` replaces the grid:
  one active panel body (`ActivePanelContent`) with a header (`MobilePanelHeader`)
  and a bottom `MobileTabBar`. Default active panel is `camera`.
- **Available actions** — Bottom tabs from `MOBILE_TAB_META`: CAM, LDR, SYS, IMU,
  TEL, and PILOT. Selecting a data tab sets the active panel; PILOT navigates to
  `/pilot/:robotId`. Header shows the `TopicSelector` for panels that support it
  (everything except camera and status).
- **State / data sources** — Same props as desktop (`ros`, `connected`,
  `selectedTopics`, `filteredTopics`, `onTopicChange`, `onConnect`, `onDisconnect`).
  `ActivePanelContent` maps the active tab to the matching panel and only the
  active panel maintains a subscription. Note: mobile exposes five data panels —
  **Controls is not a mobile data tab**; driving is done via Pilot Mode.
- **Connected vs disconnected** — Each panel renders its own connected/disconnected
  body exactly as on desktop.

### Workspace not-found

- **Responsibilities** — `WorkspaceNotFound.tsx` renders when the `:id` param does
  not match any robot in the store (`if (!robot)` in `WorkspacePage`).
- **Available actions** — `Back to Fleet` link (→ `/fleet`).
- **State / data sources** — Prop `robotId` only; message "Robot not found: <id>".
- **Connected vs disconnected** — N/A (the robot does not exist).

## Manual test cases

> Live robot URL for happy-path steps:
> `wss://<your-robot-host>`
> Add a robot with this URL from the Fleet page first, then connect.

### Happy path

- **TC-01 — Open workspace.** From Fleet, click a robot card's **VIEW** action (or
  the sidebar entry). Confirm the URL is `/robot/:id`, the page renders inside
  `AppShell`, and the 3×2 grid shows six panels: Camera, LiDAR, System Status, IMU
  Attitude, Controls, Telemetry.
- **TC-02 — Connect.** In the System Status panel click **Connect**. Confirm the
  status dot/label transitions CAUTION → NOMINAL and the button becomes
  **Disconnect**. UPTIME and BATTERY rows appear.
- **TC-03 — Camera streams.** With the robot connected, confirm the Camera panel
  shows live video (not the "Disconnected" empty state).
- **TC-04 — LiDAR streams.** Confirm the LiDAR panel draws colored scan points and
  the footer `PTS` count is > 0; `RANGE` shows `3m`. Scroll-wheel over the canvas
  and click +/− to confirm zoom changes the readout (e.g. 1.0x → 1.2x).
- **TC-05 — IMU streams.** Confirm the IMU panel shows a live attitude horizon /
  compass (ATT+CMP). Open `MODE:` and switch to NUM, ATT, 3D — confirm each view
  renders with live roll/pitch/yaw.
- **TC-06 — System Status / graph.** Confirm NODES / TOPICS / SERVICES / ACTIONS
  show non-zero counts; expand one row and confirm the name list appears (and only
  one row stays open at a time). Confirm BATTERY shows a percentage and LAST SEEN
  updates.
- **TC-07 — Telemetry streams.** Confirm the Telemetry chart draws at least one
  series with a legend; points accumulate over the 30s window.
- **TC-08 — Select a topic.** In the LiDAR (or IMU / Telemetry) header, open the
  topic dropdown, pick a different matching topic, and confirm the panel re-streams
  from the new topic and the selection persists.
- **TC-09 — Minimize then restore.** Click **Minimize panel** on LiDAR. Confirm it
  leaves the grid, the grid reflows, and a LiDAR button appears in the
  MinimizedPanelBar. Click that button and confirm LiDAR returns.
- **TC-10 — Maximize then restore all.** Click **Maximize panel** on Telemetry.
  Confirm it fills a single-cell layout (others hidden) and the header shows a
  Restore-all control. Click it and confirm all six panels return.
- **TC-11 — Drive the robot (publish cmd_vel).** In Controls, set LINEAR/ANGULAR
  via sliders, then press-and-hold a D-pad direction (or hold an arrow key).
  Confirm the status indicator goes **ACTIVE** (pulsing) and a
  `geometry_msgs/msg/Twist` is published to `/cmd_vel` (verify robot motion or the
  topic echo). Release and confirm it returns to **STOPPED** (zero Twist sent).
  Press **E-STOP** (or Escape) and confirm it stops.
- **TC-12 — Pilot Mode.** Click **Enter Pilot Mode** in Controls; confirm navigation
  to `/pilot/:id`. Navigate back to `/robot/:id`.
- **TC-13 — Mobile tab bar.** Resize the viewport below 768px. Confirm the layout
  switches to a single panel + bottom tab bar (CAM, LDR, SYS, IMU, TEL, PILOT).
  Tap each data tab and confirm the corresponding panel streams; tap PILOT and
  confirm navigation to `/pilot/:id`.
- **TC-14 — Return to fleet.** Use the sidebar / browser back to return to `/fleet`.

### Edge cases

- **TC-E1 — Invalid robot id.** Navigate to `/robot/does-not-exist`. Confirm
  `WorkspaceNotFound` renders "Robot not found: does-not-exist" with a working
  **Back to Fleet** link.
- **TC-E2 — Disconnected robot.** Open `/robot/:id` for a robot that is not
  connected (do not click Connect). Confirm: Camera shows the "Disconnected" empty
  state; LiDAR / IMU / Telemetry are muted (`opacity-50`) with no live data;
  Controls is disabled and shows **DISCONNECTED**; System Status shows OFFLINE with
  a **Connect** button and no UPTIME/BATTERY rows.
- **TC-E3 — Null / unknown IMU orientation.** Connect to a robot publishing
  `sensor_msgs/msg/Imu` with a null (or partially-null) orientation quaternion.
  Confirm the IMU panel shows **OrientationUnknown** ("Orientation unknown / IMU is
  not reporting orientation data") instead of a level horizon (T-165 / T-167).
- **TC-E4 — Null battery fields.** Connect to a robot whose BatteryState reports NaN
  / negative percentage or voltage. Confirm BATTERY shows **—** (and is not plotted
  as a bogus value in Telemetry); a genuine 0 V / 0% is shown, not treated as
  unknown (T-164).
- **TC-E5 — No LiDAR data.** Connect with no LaserScan topic (or a topic publishing
  nothing). Confirm LiDAR draws the grid/crosshair/robot with `PTS 0` and does not
  error.
- **TC-E6 — Malformed CBOR / schema failure.** Have a topic publish a malformed
  message. Confirm the panel logs a `[use*Subscription] Malformed message` warning,
  skips the bad frame, and keeps rendering (no crash / no `PanelErrorBoundary` trip).
- **TC-E7 — Topic with no publisher.** Select a discovered topic that has no active
  publisher. Confirm the panel shows empty/zeroed state and recovers when data
  resumes (auto-selection corrects stale names on the next 10s discovery poll).
- **TC-E8 — Low-bandwidth coalescing.** Simulate a bandwidth dip so messages buffer,
  then resume. Confirm LiDAR/IMU collapse the backlog to one parse per animation
  frame (`coalesce: true`) rather than blocking, and Telemetry still records every
  sample (`coalesce: false`) without dropping history (T-104 / T-161).
- **TC-E9 — Mobile layout.** Below 768px confirm `RobotWorkspaceMobile` shows the
  header topic selector only for IMU/LiDAR/Telemetry (not Camera/Status), one panel
  at a time, and that Controls is absent as a data tab (driving via PILOT).
- **TC-E10 — Panel overflow / clipping.** Maximize each panel and shrink the window;
  confirm panel bodies scroll (`overflow-auto`) without clipping headers/footers,
  and the LiDAR canvas stays square and within bounds (T-065a).
- **TC-E11 — All panels minimized.** Minimize all six panels one by one. Confirm the
  grid empties, the MinimizedPanelBar lists all six restore buttons, and restoring
  any one brings it back into a valid grid layout.
