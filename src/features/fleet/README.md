# Fleet — Feature Guide

## Overview

The Fleet feature is the entry surface of the dashboard: it lists every robot you have added, lets you add new robots (with a live connection test), and routes you into a robot's Workspace or Pilot view. It is the landing point after the marketing page.

**Route(s)** (declared in `src/App.tsx`):

- `/fleet` — primary route. Reached from the landing hero "Launch Dashboard" button (`src/features/landing/components/LandingHero.tsx`).
- `/demo` — alias route. Renders the exact same `FleetPage` component. Reached from the landing "Try Demo" button (`LandingHero.tsx`) and the landing CTA section (`src/features/landing/components/LandingCTA.tsx`). There is no separate demo behavior — `/demo` is literally `FleetPage` again.

Both routes render inside `AppShell` (`src/components/AppShell.tsx`), which provides the header, the left sidebar, the footer status bar, the mobile drawer, the `Toaster`, and the `ConnectionToastProvider`.

**Key data sources:**

- **Zustand store** — `useConnectionStore` (`src/stores/connection/useConnectionStore.ts`). State: `robots` (a `Record<string, RobotConnection>` keyed by robot id). Actions: `addRobot`, `removeRobot`, `updateRobot`, `connectRobot`, `disconnectRobot`, `setRobotTopic`. Persisted to `localStorage` under the key **`rtd-connections`**.
- **Footer selectors** — `selectConnectedCount` + `formatConnectionSummary` (`src/components/StatusBar.helpers.ts`) drive the footer "N robots connected" text. The Fleet page itself does not use these; `StatusBar` (rendered by `AppShell`) does.
- **ConnectionManager** — `connectionManager` singleton (`src/lib/rosbridge/ConnectionManager.ts`). Owns the actual roslib `Ros` WebSocket lifecycle, the 10s connection timeout (`CONNECTION_TIMEOUT = 10_000`), and exponential-backoff auto-reconnect. The store delegates all socket work to it.
- **Per-card live ROS hooks** — `RobotCard` calls `useRobotConnection`, `useRosTopics`, `useRosGraph`, `useBatterySubscription` (all from `@/hooks`) to populate graph counts and battery on a connected robot.

> Naming caveat used throughout this guide: the connection-layer status enum (`ConnectionStatus` in `useConnectionStore.types.ts`) has exactly four values — `'connected' | 'disconnected' | 'connecting' | 'error'`. There is **no** `'reconnecting'` value at this layer. Auto-reconnect is surfaced as `status: 'connecting'` together with a non-null `reconnectAttempt`. (A separate `'reconnecting'` literal exists only in the unrelated WebRTC video pipeline, not in Fleet.)

## Flow map

```
Landing page
  ├─ "Launch Dashboard" ──> /fleet
  └─ "Try Demo" / CTA   ──> /demo  (same FleetPage)
                              │
                              ▼
                     ┌────────────────┐
        robots == 0  │  FleetPage     │  robots > 0
        ┌────────────┤  (AppShell)    ├────────────┐
        ▼            └────────────────┘            ▼
  FleetEmptyView                            FleetRobotGrid
  "No Robots Configured"                    (1→4 col responsive grid)
  [Add Robot] CTA                           one RobotCard per robot
        │                                          │
        │                            ┌─────────────┼───────────────────────────┐
        ▼                            ▼             ▼                            ▼
  AddRobotModal  <───── header [Add Robot] ──  View ──> /robot/:id      Pilot ──> /pilot/:id
        │                            (always available)  (Workspace)            (Pilot)
        ▼
  validateRobotForm (Zod)
        │ invalid → per-field error, stop
        ▼ valid
  testConnectionWithRetries (up to RECONNECT_MAX_ATTEMPTS = 3, NO backoff between tries)
        │ all attempts fail → form error "Failed after 3 attempts", modal stays open
        ▼ success
  addRobot(name, url)
        │ duplicate id → name error "A robot with that name already exists", stop
        ▼ id returned
  connectRobot(id)  ──> ConnectionManager.connect()
        │                    status: connecting → connected | error
        ▼
  modal closes, RobotCard appears in grid + Sidebar fleet list

RobotCard status branches (driven by robot.status):
  connecting ─ badge "Caution" (spinning) ─ Connect button shows "Connecting", disabled
  connected  ─ badge "Nominal"  ─ live battery + graph counts ─ Disconnect button
  disconnected ─ badge "Offline" ─ dashes for graph ─ Connect button
  error      ─ badge "Critical" ─ dashes for graph ─ Connect button (retry)

Reconnect branch (socket drops after being connected, not intentional):
  ConnectionManager.scheduleReconnect → status: connecting, reconnectAttempt: 1..3
  exhausted (>= 3) → status: error, lastError "Failed after 3 attempts"

Disconnect:  Disconnect button → disconnectRobot(id) → status: disconnected (no auto-reconnect)
Delete:      trash icon → AlertDialog "Remove <name>?" → removeRobot(id) → disconnect + drop from store + grid + sidebar
```

## Segments

### Empty fleet view (`FleetEmptyView`)

- **Responsibilities:** Shown by `FleetPage` when `Object.values(robots).length === 0`. Centered empty state inviting the user to add a first robot.
- **Available actions:** Single **"Add Robot"** button (renders `AddRobotModal`'s trigger). Copy: heading "No Robots Configured", body "Add your first robot to begin monitoring. Connect to any ROS2 robot running rosbridge." Icon: `Radio` (Lucide), dimmed accent.
- **State / data sources:** Reads `robots` from `useConnectionStore`. No ROS topics. The page header's separate Add Robot button is hidden in this state (`{hasRobots && <AddRobotModal />}` in `FleetPage.tsx`); the only Add CTA is inside the empty view.
- **Connected vs disconnected:** N/A — by definition there are no robots.

### Add Robot modal (`AddRobotModal`)

- **Responsibilities:** Collect a robot name + rosbridge URL, validate, run a live connection test with retries, then add the robot to the store and connect it. Two visual modes: desktop centered dialog (shadcn `Dialog`), mobile full-screen overlay with a back-arrow header (`MobileHeader`).
- **Available actions:**
  - **Trigger button** "Add Robot" (Lucide `Plus`) — opens the modal. Appears both in `FleetEmptyView` and in the `FleetPage` header (when robots exist).
  - **Robot Name** input (`#robot-name`, `maxLength={50}`, placeholder `e.g., Atlas-01`).
  - **Rosbridge URL** input (`#robot-url`, `inputMode="url"`, mono font, placeholder `e.g., 192.168.1.100 or wss://robot.example.com`).
  - **Submit button** — label "Add Robot"; while testing it shows a spinner and `Connecting... (attempt N/3)`. Disabled (`isSubmitDisabled`) while connecting or while either field is empty (after trim).
  - **Close** — desktop: clicking outside / Esc (no explicit X; `showCloseButton={false}`). Mobile: the back arrow (`MobileHeader`, `aria-label="Close add robot form"`). Closing resets the form (`resetForm`).
- **State / data sources:**
  - Local component state: `open`, `name`, `url`, `errors`, `isConnecting`, `connectAttempt`.
  - `addRobot` and `connectRobot` from `useConnectionStore`.
  - **Validation:** `validateRobotForm(name, url)` (`AddRobotModal/helpers.ts`) → Zod `addRobotSchema` (`src/features/fleet/schemas.ts`). Name: required, ≤ 50 chars. URL: required, must pass `normalizeRosbridgeUrl` (`src/features/fleet/helpers.ts`) which converts bare host / `http(s)://` to `ws(s)://` and rejects anything that doesn't parse to a `ws:`/`wss:` URL. On success it returns the normalized `url`.
  - **Connection test:** `testConnectionWithRetries(url, onAttempt)` loops `attempt` from 1 to `RECONNECT_MAX_ATTEMPTS` (= 3, from `src/constants/reconnection.ts`), calling `connectionManager.testConnection(u)` each time. `testConnection` opens a throwaway `Ros` socket with a 10s timeout, resolves on `connection`, rejects on `error`/`close`/timeout. **There is no delay/backoff between these three test attempts** — they fire back-to-back as each fails. After the 3rd failure it returns `{ connected: false, error: 'Failed after 3 attempts' }`, shown via `FormError`.
  - **Mixed-content detection:** `detectMixedContent(url)` returns `true` when the page is served over `https:` and the entered URL normalizes to / starts with `ws://`. When true, `MixedContentWarning` renders under the URL field (does **not** block submit).
  - **Duplicate detection:** `addRobot` computes the id via `toRobotId(name)` and returns `null` if a robot with that id already exists; the modal then sets the name error "A robot with that name already exists".
- **Connected vs disconnected:** On successful test → `addRobot` (initial `status: 'disconnected'`) → `connectRobot(id)` (drives `connecting` → `connected`), then the modal closes. If `addRobot` returns null (duplicate) or `connectRobot` throws, the modal stays open with an error.

### Robot card — connected (`RobotCard`, `robot.status === 'connected'`)

- **Responsibilities:** Show identity, connection info, live battery, ROS graph counts, and navigation/connection actions for one connected robot.
- **Available actions:**
  - **View** → `Link` to `/robot/:id` (Workspace).
  - **Pilot** → `Link` to `/pilot/:id` (Crosshair icon).
  - **Disconnect** button (Lucide `Unplug`) → `disconnectRobot(id)`.
  - **Delete** trash icon (`RobotDeleteButton`) → opens AlertDialog "Remove `<name>`?" with Cancel / Remove.
- **State / data sources:** `useRobotConnection(robot.id)` gives the live `ros` instance; `useRosTopics(ros)`, `useRosGraph(ros)`, `useBatterySubscription(ros, topics)` populate the card. Status badge config from `RobotCard/constants.ts` (`connected` → green `CheckCircle`, label "Nominal"). Left border color from `ROBOT_COLOR_CLASSES[robot.color]`.
- **Connected vs disconnected:** When connected, `RobotCardGraph` shows real `nodes / topics / services / actions` counts (it requires both `isConnected && graph`); `RobotCardVitals` shows the live battery percentage (colored via `getBatteryColor`, "—" until discovered). "Last seen" shows a relative time via `formatLastSeen` (e.g. "just now", "5s ago").

### Robot card — disconnected / error (`RobotCard`, `status === 'disconnected'` or `'error'`)

- **Responsibilities:** Same layout, idle data.
- **Available actions:** **View**, **Pilot**, **Connect** (Lucide `PlugZap`) → `connectRobot(id)`, and **Delete**. (View/Pilot links are always present regardless of status — navigating to a disconnected robot is allowed; the destination page handles the no-connection case.)
- **State / data sources:** Badge config: `disconnected` → gray `MinusCircle` "Offline"; `error` → red `AlertTriangle` "Critical". `RobotCardGraph` shows dashes ("—") because `isConnected` is false. Battery shows "—".
- **Connected vs disconnected:** This is the disconnected face — all live telemetry is dashed; the action toggle reads "Connect".

### Robot card — connecting / reconnecting (`RobotCard`, `status === 'connecting'`)

- **Responsibilities:** Indicate an in-flight connection or an automatic reconnect attempt.
- **Available actions:** View, Pilot, Delete remain available. The connection toggle button shows a spinning `Loader2` with label "Connecting" and is **disabled** (`disabled={isConnecting}`).
- **State / data sources:** Badge config: `connecting` → spinning `Loader2`, label "Caution". During an auto-reconnect the store also carries `reconnectAttempt` (1..3) set by `ConnectionManager.scheduleReconnect`; the card itself does not print the attempt number (that text lives in the Add Robot modal). Graph/battery stay dashed until `status` flips to `connected`.
- **Connected vs disconnected:** Transient. Resolves to `connected` on success, or to `error` ("Connection timed out" / socket error, then up to 3 backoff reconnect attempts via `calculateBackoffDelay` = `min(2000 * 2^attempt, 30000)` ms, then `'error'` with "Failed after 3 attempts").

### Sidebar fleet list (`src/components/Sidebar/Sidebar.tsx`)

- **Responsibilities:** Mirror the fleet in the left nav. Each robot is a `NavItem` linking to `/robot/:id`, tinted by its `robotColor` and showing its `status`.
- **Available actions:** Click a robot to navigate to its Workspace. Collapse/expand the sidebar.
- **State / data sources:** Reads `s.robots` directly from `useConnectionStore` (not hardcoded — per project rule). When `robots.length === 0` and not collapsed it shows "No robots".
- **Connected vs disconnected:** The list is present for all statuses; status is reflected on each `NavItem`.

## Manual test cases

> Use the placeholder live robot URL `wss://<your-robot-host>/rosbridge` wherever a reachable robot is required.

### Happy path

- **TC-01 — Open empty fleet**
  - Preconditions: `localStorage` key `rtd-connections` absent or its `robots` empty.
  - Steps: 1) Open the landing page. 2) Click **Launch Dashboard**. 3) Confirm URL is `/fleet`.
  - Expected: `FleetEmptyView` renders — `Radio` icon, "No Robots Configured", body copy, and one **Add Robot** button. Footer reads "No robots connected". Sidebar Fleet section shows "No robots".

- **TC-02 — Open the Add Robot modal**
  - Preconditions: On `/fleet` (empty or not).
  - Steps: 1) Click **Add Robot**.
  - Expected: Dialog opens with title "Add Robot", description "Enter connection details for a new robot.", a Robot Name field, a Rosbridge URL field, and a disabled submit button (both fields empty).

- **TC-03 — Add a valid robot and watch it connect**
  - Preconditions: Modal open; the placeholder URL is reachable.
  - Steps: 1) Type a name, e.g. `Atlas-01`. 2) Type `wss://<your-robot-host>/rosbridge`. 3) Click **Add Robot**.
  - Expected: Submit shows spinner + `Connecting... (attempt 1/3)`. On a successful test the modal closes; a `RobotCard` for "Atlas-01" appears. Its status badge transitions Caution → **Nominal**; left border is colored (deterministic from the name). Battery and graph counts populate as ROS data arrives. Footer updates to "1 robot connected". Sidebar shows the robot under Fleet.

- **TC-04 — Add a second robot from the header button**
  - Preconditions: At least one robot already present.
  - Steps: 1) On `/fleet`, click the **Add Robot** button in the page header (top-right). 2) Add another robot with a different name and the placeholder URL.
  - Expected: Grid now shows two cards; on a wide viewport they sit in separate columns. Each card has its own border color. Footer count increments.

- **TC-05 — Open the Workspace from a card**
  - Preconditions: One connected robot.
  - Steps: 1) On its card click **View**.
  - Expected: Navigates to `/robot/<id>` where `<id>` is `toRobotId(name)` (e.g. `atlas-01`). Workspace page loads for that robot.

- **TC-06 — Open the Pilot view from a card**
  - Preconditions: One robot present.
  - Steps: 1) Return to `/fleet`. 2) Click **Pilot** on the card.
  - Expected: Navigates to `/pilot/<id>`.

- **TC-07 — Disconnect a connected robot**
  - Preconditions: One robot in `connected` state.
  - Steps: 1) On its card click **Disconnect**.
  - Expected: `disconnectRobot(id)` runs; status badge becomes **Offline**, graph counts and battery show "—", the toggle button now reads **Connect**. No auto-reconnect occurs (intentional disconnect). Footer count decrements.

- **TC-08 — Delete a robot**
  - Preconditions: Robot present (any status).
  - Steps: 1) Click the trash icon on the card. 2) In the "Remove `<name>`?" dialog click **Remove**.
  - Expected: Card disappears from the grid, robot disappears from the sidebar. If it was connected, the socket is closed first (`removeRobot` calls `connectionManager.disconnect`). If it was the last robot, the page reverts to `FleetEmptyView`.

### Edge cases

- **TC-E1 — Empty fields block submit**
  - Steps: Open modal, leave both fields blank.
  - Expected: Submit button is disabled. Typing then clearing a field re-disables it (trim-based). Submitting via Enter does nothing while disabled.

- **TC-E2 — Empty name or empty URL on forced submit**
  - Steps: Fill only one field, force submit (e.g. fill name only — note submit is disabled until both non-empty, so type a space-only value to test trim, then a real value in one and clear the other is not possible while disabled; instead enter both, then test the Zod path by submitting a name >50? see TC-E3).
  - Expected: `validateRobotForm` surfaces "Robot name is required" / "Rosbridge URL is required" as per-field `FieldError` (red, mono) with `aria-invalid` set, and the input border turns critical-red. Errors clear on next keystroke in that field.

- **TC-E3 — Invalid URL**
  - Steps: Name `Bot`, URL `not a url` (or `htp://x`, or a string that can't parse). Submit.
  - Expected: URL field error "Invalid URL — enter an IP, hostname, or WebSocket URL". No connection test runs.

- **TC-E4 — URL normalization (positive)**
  - Steps: Enter URL `192.168.1.50` (bare host) → submit; separately try `https://robot.example.com`.
  - Expected: `normalizeRosbridgeUrl` turns bare host into `wss://192.168.1.50` and `https://` into `wss://`; validation passes and the connection test proceeds (will then fail/timeout if unreachable — see TC-E6). The stored `url` is the normalized `wss://...` form.

- **TC-E5 — ws:// on an HTTPS page (mixed content)**
  - Preconditions: App served over HTTPS (e.g. the deployed GitHub Pages site).
  - Steps: Enter a URL beginning `ws://` (e.g. `ws://192.168.1.50`).
  - Expected: `MixedContentWarning` appears under the URL field (caution-colored, `role="alert"`): "This page is served over HTTPS. Browsers block insecure ws:// connections from secure pages. Use wss:// or a proxy with TLS." The warning is advisory — submit is still allowed but the browser-level block will cause the connection test to fail. On a local `http://localhost` dev server this warning does not appear.

- **TC-E6 — Unreachable host: retry then error**
  - Steps: Name `Ghost`, URL `wss://10.255.255.1` (non-routable). Submit.
  - Expected: Submit button cycles `Connecting... (attempt 1/3)` → `(2/3)` → `(3/3)` as each `testConnection` attempt fails (each attempt itself can wait up to the 10s socket timeout before failing; attempts fire with no extra backoff between them). After the 3rd failure a `FormError` shows "Failed after 3 attempts" plus the hint "Check the URL and ensure the robot is powered on." The robot is **not** added; the modal stays open.

- **TC-E7 — Duplicate robot**
  - Preconditions: A robot named `Atlas-01` already exists (id `atlas-01`).
  - Steps: Open modal, name `Atlas-01` (or `atlas 01` — `toRobotId` collapses both to `atlas-01`), any reachable URL. Submit.
  - Expected: Connection test runs first; on success `addRobot` returns `null`, and the name field shows "A robot with that name already exists". No second card is created.

- **TC-E8 — Add a robot while another is reconnecting (T-114)**
  - Preconditions: Robot A is mid auto-reconnect (`status: 'connecting'`, `reconnectAttempt` 1..3) after its socket dropped.
  - Steps: Open the Add Robot modal and add Robot B with the placeholder URL.
  - Expected: Adding B works independently; A's reconnect timers/attempts are tracked per-id in `ConnectionManager` (`reconnectTimers`/`reconnectAttempts` maps keyed by id), so B's flow does not cancel or interfere with A's. A continues its backoff schedule; B appears and connects on its own.

- **TC-E9 — Very long URL truncation on card (T-111)**
  - Preconditions: A robot added with a long URL, e.g. `wss://<your-robot-host>/rosbridge/some/very/long/path/segment`.
  - Steps: View the card's "URL" row.
  - Expected: The URL value is truncated with ellipsis and does not overflow the card — `RobotCardConnection` applies `truncate max-w-45` to the URL value. The card layout stays intact (no horizontal scroll, no pushed-out badges).

- **TC-E10 — Mobile layout**
  - Steps: Resize to a narrow viewport (e.g. 375×812). Open `/fleet`; open the Add Robot modal.
  - Expected: Grid collapses to a single column (`grid-cols-1`). The Add Robot modal renders full-screen (`max-sm:fixed inset-0 ... h-full`) with the `MobileHeader` back-arrow instead of a centered dialog; the submit button sits at the bottom (`max-sm:mt-auto`). Sidebar is reachable via the header hamburger drawer.

- **TC-E11 — Delete while connected**
  - Preconditions: A robot in `connected` state.
  - Steps: Click trash → **Remove**.
  - Expected: `removeRobot` first calls `connectionManager.disconnect(id)` (closes socket, clears reconnect timers, marks intentional disconnect) then drops the robot from the store. No stray reconnect fires afterward; footer count decrements; card and sidebar entry vanish.

- **TC-E12 — Browser refresh persistence (`rtd-connections`)**
  - Preconditions: One or more robots added.
  - Steps: 1) Reload the page (or reopen the tab).
  - Expected: Robots reappear from `localStorage` key **`rtd-connections`**. Persisted shape is partialized: `status` is forced back to `'disconnected'`, and `lastError`, `lastSeen`, `reconnectAttempt` are reset to `null` on persist (and again on `merge`). So after refresh every card shows **Offline** with dashed telemetry until you click **Connect** — the app does **not** auto-connect on startup. `color` and `selectedTopics` survive; an invalid/missing color is re-derived via `assignRobotColor`. Corrupt persisted data that fails `persistedStateSchema` is discarded (falls back to current state).

- **TC-E13 — Robot color cycling (colored left border)**
  - Steps: Add several robots with distinct names.
  - Expected: Each card's left border (`border-l-4`) and identity icon are colored by `ROBOT_COLOR_CLASSES[robot.color]`. The color is assigned deterministically by `assignRobotColor(name)` — a hash of the name modulo the 12-color palette (`blue, cyan, green, amber, red, purple, teal, orange, pink, lime, indigo, rose`). The same name always yields the same color across reloads; different names usually differ but may collide (hash modulo). The sidebar `NavItem` uses the same `robotColor`.
