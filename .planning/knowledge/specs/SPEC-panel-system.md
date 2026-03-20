# Feature Spec: Panel System

## What It Does

Provides the top-level workspace layout for the dashboard. Three distinct modes — Dashboard, Pilot,
Engineer — each with its own layout paradigm and panel composition. Users switch modes via header
buttons; each mode saves its layout independently in localStorage. Modes are designed so the default
layout is immediately useful without any customization.

The Panel System is the host for all telemetry widgets (Phase 5). Widgets live inside panels; the
Panel System controls where panels appear, how they can be resized and moved, and which widgets are
available in each mode.

---

## Architecture Overview

```
ModeStore (Zustand)
  └─ currentMode: 'dashboard' | 'pilot' | 'engineer'
  └─ switchMode(mode): saves current layout, loads target layout

PanelRegistry
  └─ widgetMeta[] per mode (which widgets are available)
  └─ defaultLayout per mode (grid positions at first load)

LayoutStore (Zustand, per mode)
  └─ layouts: Record<ModeKey, Layout>   ← react-grid-layout layout arrays
  └─ saveLayout(mode, layout): persist to localStorage
  └─ resetLayout(mode): restore default, set skipNextSave guard

ModeSwitcher (UI component)
  └─ 3 header buttons: DASHBOARD | PILOT | ENGINEER
  └─ Active mode highlighted

ModeRenderer
  └─ <DashboardMode /> | <PilotMode /> | <EngineerMode />
  └─ Conditional render based on ModeStore.currentMode
```

---

## Mode 1: Dashboard (Map Sovereign)

### Vision

Fleet overview and planning mode. Map dominates the center showing robot positions, SLAM data, and
paths. Video feeds appear as small PIP tiles flanking the map. Fleet status and alerts fill the
remaining columns. Inspired by Anduril Lattice and QGroundControl overview screens.

### Layout Structure

```
┌──────────────────────────────────────┐
│ [Bot1:●] [Bot2:●] [Bot3:○]  header   │
├───────┬──────────────────┬───────────┤
│ Vid 1 │                  │  Vid 2    │
│ (PIP) │   MAP (SLAM)     │  (PIP)    │
│       │   [robot dots]   │           │
├───────┤   [paths]        ├───────────┤
│ Fleet │                  │  Alerts   │
│ Status│                  │           │
└───────┴──────────────────┴───────────┘
```

- **3-column grid**: left sidebar (25%), center (50%), right sidebar (25%)
- **Center**: Map panel — sovereign, always present, cannot be closed in Dashboard mode
- **Left column, top**: Video PIP for Robot 1 (or selected robot)
- **Left column, bottom**: Fleet Status panel
- **Right column, top**: Video PIP for Robot 2 (or secondary robot)
- **Right column, bottom**: Alerts panel

### Available Panels

| Panel        | Widget            | Closable? | Notes                           |
| ------------ | ----------------- | --------- | ------------------------------- |
| Map (SLAM)   | SlamMapWidget     | No        | Sovereign panel, always visible |
| Video PIP 1  | VideoWidget       | Yes       | First robot video               |
| Video PIP 2  | VideoWidget       | Yes       | Second robot video (if present) |
| Fleet Status | FleetStatusWidget | No        | Shows all connected robots      |
| Alerts       | AlertsWidget      | Yes       | Connection + system alerts      |

### Default Layout

On first load (no localStorage entry for `dashboard-layout`):

```
react-grid-layout lg (>=1200px):
  map:          { x:3,  y:0, w:6, h:8 }
  video-pip-1:  { x:0,  y:0, w:3, h:4 }
  fleet-status: { x:0,  y:4, w:3, h:4 }
  video-pip-2:  { x:9,  y:0, w:3, h:4 }
  alerts:       { x:9,  y:4, w:3, h:4 }
```

### Resize / Interaction Behavior

- Map panel: resizable via border drag but minimum width 40% of grid
- PIP panels: resizable; minimum size 2×2 grid units
- Fleet Status and Alerts: resizable within sidebar column
- No panel move (drag-to-reorder) in Dashboard mode — fixed column structure
- Right-click panel header: opens context menu with "Reset to Default", "Remove" (if closable)
- [+] button in header adds a new video PIP slot (up to 4 robots)

### Mobile Behavior (sm < 768px)

- Single-column stacked layout (no sidebar columns)
- Order: Fleet Status → Map (full width, taller) → Video PIP(s) → Alerts
- No drag/resize on mobile
- Map uses a collapsed height (50vw) by default; tap to expand to full-screen overlay
- PIP videos stack below map as fixed-height cards

---

## Mode 2: Pilot (Video Sovereign)

### Vision

Active teleoperation mode. The video feed dominates the upper portion. LiDAR renders as a HUD
minimap overlay (gaming-style, bottom-left corner of the video). Instrument readouts (heading,
velocity, battery) overlay the right edge of the video. D-pad + velocity controls + E-stop live
below the video as a fixed panel. A customizable telemetry row occupies the bottom.

### Layout Structure

```
┌────────────────────────────────────┐
│ VIDEO FEED                          │
│  ┌───────┐     heading: 045°        │
│  │ LiDAR │     vel: 0.5 m/s         │
│  │ (HUD) │     batt: 85%            │
│  └───────┘                          │
├────────────────────────────────────┤
│ [←][↑][→][↓]   vel slider   [STOP] │
├────────┬─────────┬──────────┬──────┤
│ IMU    │ Plot 1  │ Topics   │ [+]  │
└────────┴─────────┴──────────┴──────┘
```

- **Upper zone**: Video panel (sovereign) with LiDAR HUD overlay and instrument overlays
- **Middle zone**: Controls panel (fixed, cannot be removed)
- **Bottom row**: Customizable telemetry panels

### Available Panels

| Panel           | Widget               | Zone    | Closable? | Notes                           |
| --------------- | -------------------- | ------- | --------- | ------------------------------- |
| Video Feed      | VideoWidget          | Upper   | No        | Sovereign, always visible       |
| LiDAR HUD       | LidarHudOverlay      | Overlay | No        | Rendered inside video, not grid |
| Instruments HUD | InstrumentHudOverlay | Overlay | No        | Rendered inside video, not grid |
| Controls        | RobotControlsWidget  | Middle  | No        | Fixed below video               |
| IMU             | ImuWidget            | Bottom  | Yes       | Default in bottom row           |
| Data Plot       | DataPlotWidget       | Bottom  | Yes       | Default in bottom row           |
| Topic List      | TopicListWidget      | Bottom  | Yes       | Default in bottom row           |

### LiDAR HUD Overlay

The LiDAR HUD is NOT a grid panel. It is a positioned overlay rendered inside the video panel:

```typescript
// Rendered inside VideoPanel, not by grid system
// Position: bottom-left, 20% video width, square aspect ratio
// z-index above video canvas, below instrument overlays
// Semi-transparent background: bg-black/60
// Border: 1px solid --color-telemetry (electric blue)
```

- `LidarHudOverlay` receives same `robotId` as the video feed
- Displays LiDAR scan in minimap style (polar coordinates, robot at center)
- Tap/click to toggle expanded (fullscreen LiDAR view) on both desktop and mobile
- `isVisible` persisted to localStorage — user can hide HUD; toggle via right-click context menu

### Instrument HUD Overlay

Rendered inside the video panel, right edge:

```typescript
// Position: right edge of video, top-aligned
// Displays: heading (deg), linear velocity (m/s), battery %
// Translucent badge per instrument: bg-black/60, text-telemetry
// Data sources: nav_msgs/Odometry (velocity), sensor_msgs/BatteryState (battery), TF heading
```

### Default Layout

On first load:

```
react-grid-layout lg (>=1200px):
  video:      { x:0, y:0, w:12, h:8 }   ← full width, upper zone
  controls:   { x:0, y:8, w:12, h:3 }   ← full width, fixed height
  imu:        { x:0, y:11, w:3, h:3 }
  data-plot:  { x:3, y:11, w:6, h:3 }
  topic-list: { x:9, y:11, w:3, h:3 }
```

### Resize / Interaction Behavior

- Video panel: width always 12 columns (full); height resizable via bottom border drag
- Controls panel: fixed height, full width, not resizable
- Bottom row panels: resizable and reorderable via header drag
- [+] button (rightmost in bottom row) opens panel picker for bottom row only
- Panel picker shows only bottom-row-eligible widgets (IMU, DataPlot, Topics, DepthCamera)
- Right-click panel header: "Reset layout", "Remove panel", "Tab with…" (explicit tab grouping)
- LiDAR HUD visibility toggled via right-click on video panel → "Toggle LiDAR HUD"

### Tab Groups (Bottom Row)

Bottom row panels can be grouped into tabs using the explicit "Tab with…" menu option:

```typescript
// TabGroup: { panelId: string, tabs: PanelTabConfig[] }
// PanelTabConfig: { widgetId: string, label: string, robotId: string }
// Tab bar renders inside panel header — clicking tab label switches content
// [×] on tab label removes that tab (minimum 1 tab per group)
```

- Only bottom-row panels can form tab groups in Pilot mode
- Dragging a panel header to a tab group position is not supported (explicit tab button only)

### Mobile Behavior (sm < 768px)

- Full-screen video at top (native video element, no canvas overlay needed)
- LiDAR HUD: compact button in corner — tap to open bottom sheet with LiDAR view
- Instrument readings: overlay strip below video (heading | velocity | battery in a row)
- Controls: virtual D-pad below instruments (touch-optimized, large hit targets ≥ 48px)
- Bottom row panels: horizontal swipeable cards (one card at a time visible)
- [+] icon in swipeable card nav adds a new card
- No panel rearrangement on mobile

---

## Mode 3: Engineer (Foxglove-Style Panel Grid)

### Vision

Data analysis and debugging mode. Full freely-rearrangeable panel grid. Every panel can be dragged
to a new position, resized to any grid dimension, grouped into tabs. Users build a layout from the
full widget registry. No sovereign panels — everything is moveable and closable.

### Layout Structure

```
┌────────┬────────┬───────────────────┐
│ Video  │ LiDAR  │ [IMU | Plot]      │
│        │        │  (tab group)      │
├────────┤        ├───────────────────┤
│ Topics │        │ Raw Data          │
│        │        │                   │
├────────┴────────┴───────────────────┤
│ Time Series Plot                     │
└──────────────────────────────────────┘
  Everything resizable / rearrangeable
```

### Available Panels

All widgets available (no restrictions):

| Widget            | Default in layout? |
| ----------------- | ------------------ |
| VideoWidget       | Yes                |
| LidarWidget       | Yes                |
| ImuWidget         | Yes (tab group)    |
| DataPlotWidget    | Yes (tab group)    |
| TopicListWidget   | Yes                |
| DepthCameraWidget | No (add via [+])   |
| SlamMapWidget     | No (add via [+])   |
| FleetStatusWidget | No (add via [+])   |

### Default Layout

On first load:

```
react-grid-layout lg (>=1200px), 12 columns:
  video:      { x:0,  y:0, w:4, h:6 }
  lidar:      { x:4,  y:0, w:4, h:6 }
  tab-group-1: { x:8,  y:0, w:4, h:6 }   ← tabs: [IMU, DataPlot]
  topic-list: { x:0,  y:6, w:4, h:4 }
  data-plot:  { x:4,  y:6, w:8, h:4 }
```

### Resize / Interaction Behavior

- All panels: fully resizable via border drag (snap to grid tracks)
- All panels: moveable via header drag to any grid position
- Panels snap to nearest grid cell when dropped (no free-form pixel placement)
- [+] button (global, in page header or empty grid area) opens full panel picker
- Panel picker: searchable grid of all available widgets with descriptions
- Tab grouping: right-click panel header → "Tab with…" → pick target panel; or panel header "Tab"
  button (explicit, never drag-to-tab)
- Remove: [×] in panel header corner OR right-click → "Remove panel"
- Reset: right-click on any panel → "Reset layout" restores Engineer default layout

### Tab Groups (Engineer Mode)

Full tab group support anywhere in the grid:

```typescript
// Any panel can become part of a tab group
// Tab group occupies one grid cell (same resize/move as single panel)
// Tabs render in panel header bar: [IMU] [Plot] [+tab]
// [+tab] in tab header adds another panel as a new tab
// [×] on tab removes that widget from group; if last tab, removes the group cell
```

### Mobile Behavior (sm < 768px)

- Engineer mode is hidden from the mode switcher on mobile (too complex for touch)
- If user somehow accesses engineer route directly on mobile: show "Engineer mode requires
  desktop viewport" message with a link to switch to Pilot mode
- No partial Engineer-on-mobile fallback — clean hard boundary

---

## Infrastructure

### Mode Store

```typescript
// src/features/dashboard/stores/modeStore.ts
interface ModeState {
  currentMode: DashboardMode;
  switchMode: (mode: DashboardMode) => void;
}

type DashboardMode = 'dashboard' | 'pilot' | 'engineer';
```

**Behavior:**

- `switchMode` is synchronous — no loading state; mode renders immediately
- Mode stored in `sessionStorage` (survives page refresh in same session, reset on close)
- Robot subscriptions are NOT torn down on mode switch — RxJS streams continue uninterrupted

### Layout Store

```typescript
// src/features/dashboard/stores/layoutStore.ts
interface LayoutState {
  layouts: Record<DashboardMode, ReactGridLayout.Layout[]>;
  skipNextSaveRef: React.MutableRefObject<boolean>; // ISS-008 guard
  saveLayout: (mode: DashboardMode, layout: ReactGridLayout.Layout[]) => void;
  resetLayout: (mode: DashboardMode) => void;
  getLayout: (mode: DashboardMode) => ReactGridLayout.Layout[];
}
```

**localStorage keys:**

- `rdt-layout-dashboard`
- `rdt-layout-pilot`
- `rdt-layout-engineer`

**Behavior:**

- `saveLayout`: writes to localStorage; no-op if `skipNextSaveRef.current === true`, then clears
  the flag
- `resetLayout`: sets `skipNextSaveRef.current = true`, then writes default layout to store and
  localStorage
- On store init: attempts to parse each localStorage key; falls back to default layout on
  parse failure (malformed JSON, schema mismatch)

### Panel Registry

```typescript
// src/features/dashboard/registry/panelRegistry.ts
interface PanelRegistryEntry {
  widgetId: string; // matches WidgetMeta.id from Phase 5
  label: string;
  description: string;
  component: React.ComponentType<PanelContentProps>;
  availableInModes: DashboardMode[];
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  isSovereign?: boolean; // cannot be removed (map in Dashboard, video in Pilot)
}

// Registry is a plain array — no barrel re-exports
// Each widget registers itself via widgetMeta (Phase 5 pattern)
// panelRegistry.ts imports all entries directly, no dynamic loading
```

**One-way dependency rule:** Registry imports widgets; widgets never import registry.

### Mode Switcher UI

```typescript
// src/features/dashboard/components/ModeSwitcher/ModeSwitcher.tsx
// Renders in app header — 3 buttons or segmented control
// Keyboard accessible (arrow keys between modes)
// Mobile: shows only DASHBOARD and PILOT (ENGINEER hidden)
// Active mode: highlighted with --color-telemetry accent, border-bottom or filled bg
```

### rowHeight Calculation (ISS-008 Prevention)

```typescript
// CORRECT — stable anchor, does not grow with content:
const rowHeight =
  breakpoint === 'lg'
    ? Math.floor(
        (window.innerHeight - HEADER_HEIGHT - BOTTOM_PADDING) / GRID_ROWS
      )
    : 60; // static for md/sm

// WRONG — never do this:
// const rowHeight = containerRef.current?.clientHeight / GRID_ROWS  ← feedback loop
```

`window.innerHeight` is read once on mount and on `resize` event (debounced 150ms). Not derived from
any layout container that could grow with panel content.

### onLayoutChange Race Guard (v2 ISS-008 companion)

```typescript
// In LayoutStore.resetLayout:
skipNextSaveRef.current = true;
setLayouts((prev) => ({ ...prev, [mode]: DEFAULT_LAYOUTS[mode] }));

// In onLayoutChange handler (react-grid-layout callback):
const handleLayoutChange = (layout: Layout[]) => {
  if (skipNextSaveRef.current) {
    skipNextSaveRef.current = false;
    return; // discard the stale save that fires immediately after reset
  }
  saveLayout(currentMode, layout);
};
```

`skipNextSaveRef` is a `useRef` (not state) so toggling it never triggers a re-render.

---

## Responsive Breakpoints

| Breakpoint | Width      | Grid Cols | Row Height  | Panel behavior             |
| ---------- | ---------- | --------- | ----------- | -------------------------- |
| lg         | ≥ 1200px   | 12        | dynamic     | Full drag/resize           |
| md         | 768–1199px | 6         | 60px static | Simplified layout, no drag |
| sm         | < 768px    | 1         | 60px static | Stacked cards, no drag     |

On breakpoint transition:

- lg → md/sm: grid switches to simplified stacked layout; drag handles hidden; layout NOT saved
  (md/sm layouts are ephemeral — only lg layout persists to localStorage)
- md/sm → lg: restores last saved lg layout
- Responsive transition does NOT fire `onLayoutChange` save (grid cols change triggers rgl's
  internal reflow, not user action; guard against saving simplified layout over lg layout)

---

## Empty State

When no robot is connected:

```typescript
// All modes show an empty state overlay on top of the (greyed-out) layout
// Dashboard empty state: "No robots connected — connect a robot to begin"
//   + [Connect Robot] button
// Pilot empty state: "No robot selected — select a robot from the fleet panel"
//   + robot selector dropdown
// Engineer empty state: panels render with NoConnectionOverlay (from Phase 5)
//   + global banner: "Connect a robot to see live data"
```

- Panel chrome (header, resize handles) remains interactive when disconnected
- Widget content replaced by `NoConnectionOverlay` from Phase 5
- Empty state does NOT prevent the user from arranging panels (they can prepare layouts offline)

---

## Edge Cases

### ISS-008: Dynamic rowHeight Infinite Loop

See Infrastructure > rowHeight Calculation above. Never derive `rowHeight` from a container that
grows with grid content. The stable anchor is always `window.innerHeight`.

**Test:** Render EngineerMode with 10 panels; verify `rowHeight` does not change between renders
(snapshot `window.innerHeight` before and after mount, assert stable value).

### onLayoutChange Race After resetLayout

See Infrastructure > onLayoutChange Race Guard above. `skipNextSaveRef` prevents the
`onLayoutChange` callback that fires synchronously after `resetLayout` from overwriting the freshly
restored default.

**Test:** Call `resetLayout('pilot')`; verify localStorage `rdt-layout-pilot` contains default
layout immediately after, not the pre-reset layout.

### Responsive Transition: lg → md

When viewport shrinks from lg (1200px) to md (900px):

1. react-grid-layout fires `onLayoutChange` with the new md layout (reflow)
2. Guard: `if (breakpoint !== 'lg') return;` in `handleLayoutChange` — md/sm changes never saved
3. lg layout in localStorage is preserved unchanged

**Test:** Playwright test — render at 1300px, arrange panels, resize to 900px, resize back to
1300px, verify original lg layout is restored.

### Mode Switch During Active Robot Connection

Switching from Pilot → Dashboard while a robot is actively connected:

- `ModeStore.switchMode('dashboard')` fires
- RxJS subscriptions in all widgets remain active (connection layer is independent of mode)
- `NoConnectionOverlay` does not appear (robot still connected)
- Dashboard map panel picks up the same `robotId` from fleet store — no reconnect required

**Test:** Mock roslib connection, switch modes, assert no subscription teardown events.

### Tab Group Edge Cases

- Removing a tab group's last tab: the tab group cell is replaced by an empty cell (available for
  re-use), NOT deleted from the grid (prevents layout shift)
- Adding a tab to a panel that is already a sovereign panel: action disabled, context menu item
  greyed out with tooltip "Sovereign panels cannot be tabbed"
- Tab group resize: all tab contents resize together (same container); each tab widget receives new
  dimensions via ResizeObserver

### Panel Picker [+] With Full Grid

If the grid has no empty cells (Engineer mode packed full):

- [+] opens panel picker normally
- New panel is added to the first available position found by `react-grid-layout`'s compaction
  algorithm; if no position, panel appended below the grid (extends scroll height)
- User is not blocked from adding panels

### Layout Schema Migration

If the localStorage layout schema changes between app versions (e.g. panel IDs renamed):

- Layout parse on init: wrap in `try/catch`; if any panel `i` ID does not match registry, treat
  entire layout as corrupted and fall back to default
- Log warning to console: `[LayoutStore] Layout corrupted or outdated — restoring defaults`
- Never silently render with a partially-broken layout

---

## Acceptance Criteria

### Mode: Dashboard

- [ ] Dashboard mode renders map in center (50% width), video PIP left, fleet status left-bottom,
      video PIP right, alerts right-bottom
- [ ] Map panel cannot be closed or removed
- [ ] Video PIP panels can be closed via [×]; fleet status and alerts cannot
- [ ] Layout persists to `rdt-layout-dashboard` in localStorage across page refreshes
- [ ] Reset option via right-click restores default layout; subsequent page load shows default
- [ ] Mobile (375px): single-column stacked layout renders, no drag handles visible
- [ ] [+] in header adds a new video PIP slot (up to 4)

### Mode: Pilot

- [ ] Pilot mode renders video panel full-width top, controls panel below, telemetry row at bottom
- [ ] LiDAR HUD overlay renders inside video panel, bottom-left corner, semi-transparent
- [ ] Instrument readouts (heading, velocity, battery) overlay video panel right edge
- [ ] Controls panel (D-pad + velocity + E-stop) cannot be closed or resized
- [ ] Bottom row panels are resizable, reorderable via header drag, and closable
- [ ] [+] at end of bottom row opens panel picker limited to bottom-row-eligible widgets
- [ ] Tab groups work in bottom row (explicit "Tab with…" menu)
- [ ] Layout persists to `rdt-layout-pilot` in localStorage
- [ ] LiDAR HUD visibility preference persists to localStorage
- [ ] Mobile (375px): video → instrument strip → virtual D-pad → swipeable telemetry cards
- [ ] Virtual D-pad touch targets ≥ 48px each

### Mode: Engineer

- [ ] Engineer mode renders fully rearrangeable grid with default 5-panel layout
- [ ] All panels draggable via header to new grid positions
- [ ] All panels resizable via border drag; panels snap to grid tracks on release
- [ ] [+] button opens panel picker with all available widgets and search filter
- [ ] Tab groups can be created via explicit "Tab with…" context menu action (not drag-to-tab)
- [ ] All panels closable via [×]; removing last panel leaves grid empty (not crashed)
- [ ] Layout persists to `rdt-layout-engineer` in localStorage
- [ ] Reset via right-click restores default layout
- [ ] Engineer mode hidden from mode switcher on mobile (< 768px)
- [ ] Accessing engineer mode on mobile renders "requires desktop" message

### Infrastructure

- [ ] `ModeStore.switchMode` is synchronous; mode renders within one frame
- [ ] Mode stored in sessionStorage; survives page refresh, resets on new session
- [ ] Robot subscriptions are NOT torn down when switching modes (assert via mock test)
- [ ] `rowHeight` for lg breakpoint derived from `window.innerHeight`, not container height
- [ ] ISS-008 regression test: 10-panel Engineer layout; verify `rowHeight` stable across renders
- [ ] `skipNextSaveRef` guard prevents onLayoutChange overwriting reset layout
- [ ] Regression test for reset race: `resetLayout` → localStorage contains default, not old layout
- [ ] Responsive transition lg → md → lg: lg layout unchanged in localStorage after round-trip
- [ ] Layout parse failure: malformed localStorage JSON falls back to default without crash
- [ ] Empty state: disconnected state shows `NoConnectionOverlay` on all widget panels
- [ ] ModeSwitcher keyboard accessible (arrow keys, focus ring visible)

---

## File Structure

```
src/features/dashboard/
  components/
    ModeSwitcher/
      ModeSwitcher.tsx
      ModeSwitcher.types.ts
      ModeSwitcher.test.tsx
    PanelFrame/                     ← shared panel chrome (header, drag handle, resize, [×])
      PanelFrame.tsx
      PanelFrame.types.ts
      PanelFrame.test.tsx
    TabGroup/                       ← tab group container
      TabGroup.tsx
      TabGroup.types.ts
      TabGroup.test.tsx
    PanelPicker/                    ← [+] add panel modal
      PanelPicker.tsx
      PanelPicker.types.ts
      PanelPicker.test.tsx
    EmptyState/
      EmptyState.tsx
      EmptyState.types.ts
  modes/
    DashboardMode/
      DashboardMode.tsx
      DashboardMode.types.ts
      DashboardMode.test.tsx
    PilotMode/
      PilotMode.tsx
      PilotMode.types.ts
      PilotMode.test.tsx
      overlays/
        LidarHudOverlay/
          LidarHudOverlay.tsx
          LidarHudOverlay.types.ts
          LidarHudOverlay.test.tsx
        InstrumentHudOverlay/
          InstrumentHudOverlay.tsx
          InstrumentHudOverlay.types.ts
          InstrumentHudOverlay.test.tsx
    EngineerMode/
      EngineerMode.tsx
      EngineerMode.types.ts
      EngineerMode.test.tsx
  stores/
    modeStore.ts
    modeStore.test.ts
    layoutStore.ts
    layoutStore.test.ts
  registry/
    panelRegistry.ts               ← imports all widget entries, no barrel re-exports
    panelRegistry.test.ts
    defaultLayouts.ts              ← DEFAULT_LAYOUTS record, one per mode
  types/
    panel-system.types.ts          ← DashboardMode, PanelRegistryEntry, TabGroup, etc.
```

---

## Dependencies

| Package             | Purpose                                  | Already in project? |
| ------------------- | ---------------------------------------- | ------------------- |
| `react-grid-layout` | Draggable, resizable panel grid          | Check Phase 2       |
| `zustand`           | ModeStore, LayoutStore                   | Yes (Phase 3)       |
| `lucide-react`      | Panel action icons ([×], drag handle, +) | Check Phase 2       |

No new dependencies expected — react-grid-layout and zustand are core to the project.
If `react-grid-layout` is not yet in the project at Phase 6, add it then.

---

## Out of Scope

- Panel-to-panel data linking (clicking a topic does not auto-open a plot)
- Collaborative or shared layouts — local only
- Drag-to-create-tab — explicit "Tab with…" button only
- 3D view panels — 2D only for v3
- Custom panel creation by users — predefined widget registry only
- Export/import layout files
- Cloud layout sync
