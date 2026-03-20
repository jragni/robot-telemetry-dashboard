# Feature Spec: Robot Control

## What It Does

Provides the teleoperation control interface for driving robots over ROS2. Consists of a button-based
directional pad, velocity sliders, topic selector, and an emergency stop. All components compose
into a `ControlWidget` that renders in the Pilot mode's middle zone (fixed panel below video feed).

Control inputs are translated into `geometry_msgs/Twist` messages and published via `TopicPublisher`
to a user-selected `cmd_vel` topic. Safety is non-negotiable: connection loss auto-activates E-Stop,
zero-velocity is published before disconnect, and no control input reaches the robot while E-Stop is
active.

---

## Pre-existing Bugs to Fix in This Phase

These bugs exist in the current codebase and MUST be fixed as part of Phase 7. They directly affect
correctness and safety of the Robot Control feature.

### BUG-001: TopicPublisher and RosTransport import mock types in production code

**File:** `src/services/ros/publisher/TopicPublisher.ts`
**File:** `src/services/ros/transport/RosTransport.ts`

Both files import `MockRos` and `MockTopic` from `@/test/mocks/roslib.mock` and use them as
production types. This is wrong — test mocks should never be imported by production code.

```typescript
// CURRENT (wrong):
import type { MockRos, MockTopic } from '@/test/mocks/roslib.mock';

// REQUIRED FIX: define real roslib-compatible interfaces in the services layer
// and use those instead
```

**Fix:** Create `src/services/ros/transport/ros.types.ts` with real interface definitions that
describe the shape of `ROSLIB.Ros` and `ROSLIB.Topic`. Replace all `MockRos`/`MockTopic` references
in production files with these interfaces. The mock classes in `roslib.mock.ts` should implement
these interfaces (satisfying the contract structurally), but production code must never import from
the test directory.

**Required interfaces:**

```typescript
// src/services/ros/transport/ros.types.ts
export interface IRos {
  isConnected: boolean;
  connect(): void;
  close(): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
  getTopics(
    callback: (result: { topics: string[]; types: string[] }) => void,
    errorCallback?: (error: string) => void
  ): void;
}

export interface ITopic {
  name: string;
  messageType: string;
  advertise(): void;
  unadvertise(): void;
  publish(message: unknown): void;
  subscribe(callback: (...args: unknown[]) => void): void;
  unsubscribe(): void;
}

export interface ITopicFactory {
  (options: { ros: IRos; name: string; messageType: string }): ITopic;
}
```

`TopicPublisher` and `RosTransport` are updated to use `IRos`, `ITopic`, `ITopicFactory`.

The `MockRos` and `MockTopic` classes in `roslib.mock.ts` are structurally compatible with these
interfaces and require no changes — they will satisfy `IRos` / `ITopic` without explicit `implements`
declarations (TypeScript structural typing).

**Test for the fix:** Import `TopicPublisher` and `RosTransport` in a test that provides a
`MockRos`/`MockTopic` matching the `IRos`/`ITopic` interfaces. If the test compiles and passes,
the fix is correct. A linter rule or `tsc --noEmit` will catch any remaining test imports in
production files.

---

### BUG-002: No connection-loss zero-velocity safety

**Current state:** When the rosbridge WebSocket connection drops, the robot continues at whatever
velocity was last commanded. There is no mechanism to publish a zero-velocity Twist or activate any
safety interlock on disconnect.

**This is the #1 safety gap.** A robot driving at 0.5 m/s that loses connection will continue until
it hits something.

**Fix:** Implemented in `useControlPublisher` (see Safety section below). This hook monitors
`connectionStore.status` and publishes zero-velocity + activates E-Stop on any transition away
from `'connected'`.

---

### BUG-003: Panel registry ID mismatch — controls panel renders nothing

**Current state:** The default Pilot layout uses `i: 'controls'` (in `defaultLayouts.ts`) but the
panel registry entry uses `widgetId: 'robot-controls'` (in `panelRegistry.ts`). The lookup
`panelRegistry.find(e => e.widgetId === baseId || e.widgetId === item.i)` fails silently and
`WidgetComponent` is `null`, so the panel renders an empty cell with just the panel ID string.

```typescript
// defaultLayouts.ts — current (wrong):
{ i: 'controls', x: 0, y: 8, w: 12, h: 3 }

// panelRegistry.ts — current (mismatched):
{ widgetId: 'robot-controls', ... }
```

**Fix:** Align the IDs. Change the default layout entry to use `i: 'robot-controls'` (match the
registry). Also update `FIXED_PANELS` and `BOTTOM_ROW_PANELS` sets in `PilotMode.tsx` accordingly.

```typescript
// defaultLayouts.ts — fixed:
{ i: 'robot-controls', x: 0, y: 8, w: 12, h: 3 }

// PilotMode.tsx FIXED_PANELS — fixed:
const FIXED_PANELS = new Set(['video', 'robot-controls']);
```

---

### BUG-004: D-pad buttons in PilotMobileLayout have no onClick handlers

**Current state:** The `PilotMobileLayout` component in `PilotMode.tsx` renders five D-pad buttons
(forward, backward, left, right, stop) with `data-testid` attributes but no event handlers. Pressing
them does nothing.

**Fix:** Replace the `PilotMobileLayout` inline component with the real `ControlPad` component once
it is implemented. The mobile D-pad is not a separate component — it IS `ControlPad` (which handles
both desktop and mobile layouts per its responsive behavior).

---

## Architecture Overview

```
ControlWidget (composite panel)
  ├─ EStop          ← safety interlock, always visible, disables all others when active
  ├─ TopicSelector  ← choose which cmd_vel topic to publish to
  ├─ ControlPad     ← direction buttons → velocity vector
  └─ VelocitySliders ← linear.x max + angular.z max

controlStore (Zustand, per-robot via robotId)
  └─ selectedTopic: string          ← persisted to localStorage per robotId
  └─ linearVelocity: number         ← current max linear (m/s)
  └─ angularVelocity: number        ← current max angular (rad/s)
  └─ eStopActive: boolean
  └─ activeDirection: Direction | null
  └─ activateEStop(): void
  └─ releaseEStop(): void
  └─ setTopic(topic: string): void
  └─ setLinearVelocity(v: number): void
  └─ setAngularVelocity(v: number): void
  └─ setDirection(d: Direction | null): void

TwistBuilder (pure utility)
  └─ buildTwist(direction, linear, angular): Twist
  └─ zeroTwist(): Twist

useControlPublisher (hook)
  └─ Bridges controlStore → TopicPublisher
  └─ Subscribes to connectionStore — auto E-Stop on disconnect (BUG-002 fix)
  └─ Debounces publish at 50ms (last-wins)
  └─ Disposes TopicPublisher handle on unmount / topic change
```

---

## Components

### 1. ControlPad

Button-based directional pad. Five buttons: Forward, Backward, Left, Right, Stop.

**NOT a joystick** — buttons for cross-platform consistency (v2 decision, no analog drift on mobile).

```
      [↑ FWD]
[← L] [■ STP] [→ R]
      [↓ BWD]
```

**Behavior:**

- Press and hold a direction: publishes Twist continuously (via debounced interval) at 50ms rate
- Release: publishes zero-velocity Twist (stop command) then clears active direction
- Stop button: immediate zero-velocity, same as E-Stop release but does not activate E-Stop
- All buttons disabled when E-Stop is active
- Visual active state on pressed button (border + bg highlight using `--color-telemetry`)

**Mobile:**

- Minimum touch target: 48×48px per button
- Touch events: `touchstart` / `touchend` (not just `onClick`) for responsive press feedback
- Multiple simultaneous touches: last direction wins (single active direction at any time)
- Replaces the inert inline D-pad in `PilotMobileLayout` (BUG-004 fix)

**Twist mapping:**

| Button   | linear.x | angular.z |
| -------- | -------- | --------- |
| Forward  | +linear  | 0         |
| Backward | -linear  | 0         |
| Left     | 0        | +angular  |
| Right    | 0        | -angular  |
| Stop     | 0        | 0         |

Where `linear` = `linearVelocity` from store, `angular` = `angularVelocity` from store.

---

### 2. VelocitySliders

Two sliders for max velocity magnitudes used in Twist construction.

**Sliders:**

| Slider           | Store field       | Default | Range     | Step | Unit  |
| ---------------- | ----------------- | ------- | --------- | ---- | ----- |
| Linear velocity  | `linearVelocity`  | 0.5     | 0.1 – 2.0 | 0.1  | m/s   |
| Angular velocity | `angularVelocity` | 0.5     | 0.1 – 2.0 | 0.1  | rad/s |

**Behavior:**

- Current value shown as a numeric label next to the slider track
- Changing slider while a direction is actively pressed: next Twist publish uses new value
- Sliders disabled when E-Stop is active
- Velocity 0 is NOT reachable via slider (min is 0.1) — Stop button / E-Stop handle zero

**Why no zero:** A slider accidentally bumped to 0 with a direction held would publish zero-velocity
without E-Stop semantics. Enforcing min=0.1 keeps zero-velocity exclusively in E-Stop / Stop button.

---

### 3. TopicSelector

Dropdown to choose which topic the Twist messages publish to.

**Behavior:**

- Lists only topics with type `geometry_msgs/Twist` (filtered from `TopicInfo[]` in connection store)
- Default: `/cmd_vel` (if present); otherwise first Twist-compatible topic; otherwise empty
- When no Twist topics available: dropdown disabled, shows "No cmd_vel topics available"
- Changing topic mid-control: disposes current `PublishHandle`, creates new one on new topic
  - If a direction is active when topic changes: direction is cleared, stop is published on old topic
- Selected topic persisted to `localStorage` keyed by `robotId`
- Topic selector disabled when E-Stop is active

---

### 4. EStop

Emergency stop. Always rendered. Always interactive (never itself disabled).

**Appearance:**

- Large red button: minimum 64×64px on desktop, 72×72px on mobile
- Label: "E-STOP" in bold
- Active state (E-Stop engaged): red fill, white text, pulsing animation
- Inactive state (ready): red border, red text, no fill
- Positioned prominently — right side of controls panel, vertically centered

**Behavior on activation:**

- Publishes `zeroTwist()` to the currently selected topic immediately (before state update)
- Sets `controlStore.eStopActive = true`
- Disables ControlPad, VelocitySliders, TopicSelector
- Shows "E-STOP ACTIVE" banner above control area

**Behavior on release:**

- User must explicitly click the E-Stop button again to release
- On release: sets `controlStore.eStopActive = false`
- Controls re-enabled
- Does NOT automatically publish a new velocity — robot stays stopped until user inputs direction

**Auto-activation on connection loss (BUG-002 fix):**

- `useControlPublisher` monitors `connectionStore.status`
- When status transitions from `'connected'` to any other state:
  1. Publish `zeroTwist()` on last-known topic (best-effort, connection may be gone)
  2. Activate E-Stop (`controlStore.activateEStop()`)
  3. Show alert toast: "Connection lost — E-Stop activated"
- E-Stop remains active after reconnection; user must manually release

---

### 5. ControlWidget

Composite panel component combining all four sub-components.

```typescript
// Props
interface ControlWidgetProps {
  robotId: string;
  panelId: string;
}
```

**Layout (desktop):**

```
┌──────────────────────────────────────┐
│ [Topic: /cmd_vel ▼]           [STOP] │
│                                      │
│         [↑ FWD]                      │
│  [← L]  [■ STP]  [→ R]              │
│         [↓ BWD]                      │
│                                      │
│  Linear: ──●────────── 0.5 m/s       │
│  Angular: ────●──────── 0.5 rad/s    │
└──────────────────────────────────────┘
```

**Layout (mobile, < 768px):**

```
┌─────────────────────┐
│ [Topic ▼]   [STOP]  │
│    [↑]              │
│ [←][■][→]           │
│    [↓]              │
│ Lin: ●── 0.5        │
│ Ang: ──● 0.5        │
└─────────────────────┘
```

**No-robot state:** When `robotId` is empty or robot is not in connection store:

- All controls disabled
- Overlay message: "Connect a robot to enable controls"

---

## Twist Message Construction

```typescript
// geometry_msgs/Twist (from src/shared/types/ros-messages.types.ts)
interface Twist {
  linear: { x: number; y: number; z: number };
  angular: { x: number; y: number; z: number };
}

// TwistBuilder — pure utility, no side effects
function buildTwist(
  direction: Direction,
  linear: number,
  angular: number
): Twist {
  const map: Record<Direction, Twist> = {
    forward: {
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0 },
    },
    backward: {
      linear: { x: -linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0 },
    },
    left: { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: angular } },
    right: {
      linear: { x: 0, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: -angular },
    },
    stop: { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } },
  };
  return map[direction];
}

function zeroTwist(): Twist {
  return { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } };
}
```

**Sign conventions:**

- Forward: positive `linear.x`
- Backward: negative `linear.x`
- Left: positive `angular.z` (counter-clockwise in ROS convention)
- Right: negative `angular.z`

---

## Safety: Auto E-Stop on Connection Loss (BUG-002 fix)

`useControlPublisher` is responsible for all safety behavior:

```typescript
// Pseudocode
useEffect(() => {
  const prevStatus = prevStatusRef.current;
  if (prevStatus === 'connected' && connectionStatus !== 'connected') {
    // Best-effort zero publish — connection may already be gone
    publishHandle.current?.publish(zeroTwist());
    controlStore.activateEStop();
    showToast('Connection lost — E-Stop activated');
  }
  prevStatusRef.current = connectionStatus;
}, [connectionStatus]);
```

- `prevStatusRef` tracks previous connection status (useRef, not state — no extra renders)
- Zero publish is fire-and-forget — do not await or retry (connection is already failing)
- E-Stop remains active even after successful reconnection (manual release required)

---

## Publish Debounce

Direction hold publishes Twist messages on a 50ms interval (20Hz):

```typescript
// When direction is set (not null and not E-Stop active):
//   setInterval(() => publishHandle.current?.publish(buildTwist(...)), 50)
// When direction cleared or E-Stop activates:
//   clearInterval, publish zeroTwist once
```

- 50ms interval: fast enough for responsive control, slow enough to not saturate rosbridge
- Last-wins: if direction changes faster than 50ms, only most recent direction is published
- Interval cleared on component unmount

---

## Edge Cases

| Scenario                              | Behavior                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| No robot connected                    | All controls disabled, "Connect a robot" overlay shown                               |
| No Twist topics available             | TopicSelector disabled, "No cmd_vel topics available"                                |
| Topic doesn't exist at publish time   | roslib will silently fail; TopicPublisher dispose + recreate on next direction input |
| E-Stop active, user presses direction | Button press ignored, no Twist published                                             |
| Velocity sliders at max (2.0 m/s)     | Twist published with 2.0 m/s — no cap beyond slider max                              |
| Direction held during topic change    | Direction cleared, zero published on old topic, new topic initialized on next input  |
| Multiple simultaneous touch inputs    | Last `touchstart` direction wins; previous direction cleared immediately             |
| Connection drops mid-publish interval | Interval fires, publish may fail silently; E-Stop triggers on status change          |
| Reconnect while E-Stop active         | E-Stop stays active; user must release manually                                      |
| robotId changes (panel reconfigured)  | controlStore instance switches; old handle disposed; new store/handle initialized    |

---

## View Integration (CRITICAL — prevents placeholder gap)

### Panel registry alignment (BUG-003 fix)

The panel registry entry and default layout must use matching IDs. The correct ID is `'robot-controls'`:

```typescript
// defaultLayouts.ts — fixed:
{ i: 'robot-controls', x: 0, y: 8, w: 12, h: 3 }

// panelRegistry.ts — replace RobotControlsWidgetPlaceholder with real ControlWidget:
{
  widgetId: 'robot-controls',
  label: 'Robot Controls',
  component: ControlWidget,           // ← replaces RobotControlsWidgetPlaceholder
  availableInModes: ['pilot'],
  isSovereign: false,                 // closable in engineer; fixed via FIXED_PANELS set in PilotMode
  defaultSize: { w: 12, h: 3 },
  minSize: { w: 6, h: 3 },
}
```

### PilotMode.tsx FIXED_PANELS update (BUG-003 fix)

```typescript
// PilotMode.tsx — update FIXED_PANELS to use correct ID:
const FIXED_PANELS = new Set(['video', 'robot-controls']);
```

### PilotMobileLayout replacement (BUG-004 fix)

Remove the inline `PilotMobileLayout` component's inert D-pad buttons. The mobile ControlPad (with
real event handlers) renders inside `ControlWidget`, which is already the panel component for the
`'robot-controls'` panel slot. The mobile pilot layout renders `ControlWidget` the same as desktop —
no separate inline D-pad needed.

### E2E verification

- Navigate to `/dashboard` → switch to Pilot mode → controls panel shows actual buttons (not "Robot Controls — coming in Phase 7")
- Click Forward → TopicPublisher.publish called with positive `linear.x` Twist (spy)
- Click EStop → direction buttons have `disabled` attribute
- Mobile viewport (375px): all touch targets reachable, layout not clipped

---

## File Structure

```
src/services/ros/transport/
  ros.types.ts                        ← NEW: IRos, ITopic, ITopicFactory interfaces (BUG-001 fix)

src/features/pilot/
  components/
    ControlWidget/
      ControlWidget.tsx
      ControlWidget.types.ts
      ControlWidget.test.tsx
    ControlPad/
      ControlPad.tsx
      ControlPad.types.ts
      ControlPad.test.tsx
    VelocitySliders/
      VelocitySliders.tsx
      VelocitySliders.types.ts
      VelocitySliders.test.tsx
    TopicSelector/
      TopicSelector.tsx
      TopicSelector.types.ts
      TopicSelector.test.tsx
    EStop/
      EStop.tsx
      EStop.types.ts
      EStop.test.tsx
  hooks/
    useControlPublisher.ts
    useControlPublisher.test.ts
  stores/
    controlStore.ts
    controlStore.test.ts
  utils/
    twistBuilder.ts
    twistBuilder.test.ts
  types/
    robot-control.types.ts      ← Direction, ControlState, ControlWidgetProps, etc.
```

**Also modified (bug fixes):**

- `src/services/ros/transport/RosTransport.ts` — replace `MockRos` → `IRos` (BUG-001)
- `src/services/ros/publisher/TopicPublisher.ts` — replace `MockRos`/`MockTopic` → `IRos`/`ITopic`/`ITopicFactory` (BUG-001)
- `src/features/dashboard/registry/defaultLayouts.ts` — `'controls'` → `'robot-controls'` (BUG-003)
- `src/features/dashboard/registry/panelRegistry.ts` — swap `RobotControlsWidgetPlaceholder` for `ControlWidget` (BUG-003)
- `src/features/dashboard/modes/PilotMode/PilotMode.tsx` — update `FIXED_PANELS`, remove inline D-pad (BUG-003, BUG-004)

**One-way data flow:**

- `ControlWidget` → reads from `controlStore`, renders sub-components
- Sub-components → dispatch to `controlStore` (no direct prop drilling of setters)
- `useControlPublisher` → reads `controlStore` + `connectionStore`, writes to `TopicPublisher`
- `TopicPublisher` (Phase 4 service) ← only consumer of ROS publish side effect

---

## Dependencies

| Package / Module     | Purpose                           | Already in project? |
| -------------------- | --------------------------------- | ------------------- |
| `zustand`            | `controlStore`                    | Yes (Phase 1)       |
| `TopicPublisher`     | Publish Twist messages            | Yes (Phase 4)       |
| `ros-messages.types` | `Twist`, `Vector3`, `TopicInfo`   | Yes (Phase 4)       |
| `connectionStore`    | Read connection status for E-Stop | Yes (Phase 4)       |
| `shadcn/ui` Slider   | VelocitySliders                   | Yes (Phase 2)       |
| `shadcn/ui` Select   | TopicSelector dropdown            | Yes (Phase 2)       |
| `lucide-react`       | Direction button icons            | Yes (Phase 2)       |

No new dependencies required.

---

## Acceptance Criteria

### Bug Fixes (must pass before feature acceptance)

- [ ] `TopicPublisher.ts` does not import from `@/test/mocks/` (BUG-001)
- [ ] `RosTransport.ts` does not import from `@/test/mocks/` (BUG-001)
- [ ] `ros.types.ts` defines `IRos`, `ITopic`, `ITopicFactory` interfaces
- [ ] `tsc --noEmit` passes with no errors after the type refactor
- [ ] Default layout `i: 'robot-controls'` matches registry `widgetId: 'robot-controls'` (BUG-003)
- [ ] Pilot mode controls panel renders actual `ControlWidget`, not placeholder text (BUG-003)
- [ ] D-pad buttons in mobile pilot layout have real event handlers (BUG-004)

### ControlPad

- [ ] Forward button publishes Twist with positive `linear.x`, zero `angular.z`
- [ ] Backward button publishes Twist with negative `linear.x`, zero `angular.z`
- [ ] Left button publishes Twist with zero `linear.x`, positive `angular.z`
- [ ] Right button publishes Twist with zero `linear.x`, negative `angular.z`
- [ ] Stop button publishes zero-velocity Twist immediately
- [ ] Holding a direction publishes at ~20Hz (50ms interval)
- [ ] Releasing direction publishes zero-velocity Twist
- [ ] All buttons disabled (non-interactive) when E-Stop is active
- [ ] Touch targets ≥ 48×48px on mobile
- [ ] Active press state visually indicated on button

### VelocitySliders

- [ ] Linear slider range: 0.1–2.0 m/s, default 0.5
- [ ] Angular slider range: 0.1–2.0 rad/s, default 0.5
- [ ] Current value displayed as numeric label
- [ ] Slider change during active direction: next publish uses new value
- [ ] Both sliders disabled when E-Stop is active

### TopicSelector

- [ ] Only lists topics with type `geometry_msgs/Twist`
- [ ] Defaults to `/cmd_vel` if available, otherwise first Twist topic
- [ ] "No cmd_vel topics available" shown when list is empty
- [ ] Topic change while direction active: direction cleared, zero published on old topic
- [ ] Selected topic persisted to localStorage keyed by robotId
- [ ] Disabled when E-Stop is active

### EStop

- [ ] Publishes zero-velocity Twist immediately on activation
- [ ] Active state: red fill, "E-STOP ACTIVE" banner visible
- [ ] All controls (pad, sliders, selector) disabled while active
- [ ] Manual release re-enables controls (no auto-publish on release)
- [ ] Auto-activates when connection status changes from 'connected' to any other state (BUG-002)
- [ ] Alert toast shown: "Connection lost — E-Stop activated" (BUG-002)
- [ ] Remains active after reconnection until manually released
- [ ] EStop button itself is never disabled (always clickable)

### ControlWidget

- [ ] Renders all four sub-components in correct layout
- [ ] "Connect a robot" overlay shown when robotId is empty / robot not connected
- [ ] Renders in Pilot mode below video panel (not a placeholder)
- [ ] Mobile layout: compact, D-pad visible, touch targets ≥ 48px

### Integration (E2E)

- [ ] Navigate to `/dashboard` → switch to Pilot mode → ControlWidget visible (not placeholder)
- [ ] Click a direction button → Twist published to mock topic (verified via TopicPublisher spy)
- [ ] E-Stop button click → disables direction buttons
- [ ] Mobile viewport (375px): all touch targets reachable, layout not clipped

---

## Out of Scope

- Joystick / gamepad input — buttons only for v3 (v2 decision: cross-platform consistency)
- Keyboard shortcuts for control — deferred, not in v3 scope
- Velocity curve / acceleration ramping — linear velocity only
- Recording/playback of control inputs — deferred (IndexedDB, Phase 2)
- Per-axis individual enable/disable — E-Stop is all-or-nothing
- Multiple simultaneous cmd_vel publishers per robot — single topic per ControlWidget instance
