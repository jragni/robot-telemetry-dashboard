# SPEC: Information Architecture Redesign (Phase 8)

**Status:** FINAL — research incorporated, ready for implementation
**Phase:** 08-ia-redesign
**Written:** 2026-03-22
**Updated:** 2026-03-22 (research findings applied; final design decisions incorporated)

---

## Overview

Replace the current dual-navbar, mode-switcher layout with a single sidebar-driven
Fleet → Robot → Detail hierarchy. The app currently has three navigation surfaces
(header nav, mode switcher bar, bottom tab bar) and a "Dashboard" label that appears
three times. This redesign collapses all navigation to one sidebar.

No new features. Restructure only.

---

## What Changes (Component by Component)

### REMOVE

| Component                | File                                              | Reason                                         |
| ------------------------ | ------------------------------------------------- | ---------------------------------------------- |
| `Header` nav links       | `src/shared/components/Header.tsx`                | Sidebar replaces top nav                       |
| `BottomTabBar`           | `src/shared/components/BottomTabBar.tsx`          | Sidebar is the only nav surface                |
| `ModeSwitcher`           | `src/features/dashboard/components/ModeSwitcher/` | No modes in new IA                             |
| `DashboardView`          | `src/features/dashboard/DashboardView.tsx`        | Replaced by `FleetOverview` + `RobotWorkspace` |
| `DashboardMode`          | `src/features/dashboard/modes/DashboardMode/`     | Consolidated into `RobotWorkspace`             |
| `PilotMode`              | `src/features/dashboard/modes/PilotMode/`         | Consolidated into `RobotWorkspace`             |
| `EngineerMode`           | `src/features/dashboard/modes/EngineerMode/`      | Becomes the new `RobotWorkspace` grid          |
| `modeStore`              | `src/features/dashboard/stores/modeStore.ts`      | No mode concept exists                         |
| `FleetView` (page)       | `src/features/fleet/FleetView.tsx`                | Fleet is now sidebar + main content area       |
| `MapView` (page)         | `src/features/map/MapView.tsx`                    | Map is now a sidebar shortcut → main content   |
| `PilotPickerView`        | `src/features/pilot/PilotPickerView.tsx`          | Replaced by sidebar robot list                 |
| `PilotView` (standalone) | `src/features/pilot/PilotView.tsx`                | Controls move into `RobotWorkspace` panel      |

### KEEP (restructured location)

| Component                   | Current Location                                       | New Location                                      |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| `ImuWidget`                 | `src/features/telemetry/components/ImuWidget/`         | Unchanged                                         |
| `LidarWidget`               | `src/features/telemetry/components/LidarWidget/`       | Unchanged                                         |
| `DataPlotWidget`            | `src/features/telemetry/components/DataPlotWidget/`    | Unchanged                                         |
| `DepthCameraWidget`         | `src/features/telemetry/components/DepthCameraWidget/` | Unchanged                                         |
| `TopicListWidget`           | `src/features/telemetry/components/TopicListWidget/`   | Unchanged                                         |
| `ControlPad`                | `src/features/pilot/components/ControlPad/`            | Unchanged (used as panel widget)                  |
| `VelocitySliders`           | `src/features/pilot/components/VelocitySliders/`       | Unchanged (used as panel widget)                  |
| `EStop`                     | `src/features/pilot/components/EStop/`                 | Unchanged (used as panel widget)                  |
| `TopicSelector`             | `src/features/pilot/components/TopicSelector/`         | Unchanged (used as panel widget)                  |
| `ControlWidget`             | `src/features/pilot/components/ControlWidget/`         | Unchanged                                         |
| `PanelFrame`                | `src/features/dashboard/components/PanelFrame/`        | Unchanged                                         |
| `PanelPicker`               | `src/features/dashboard/components/PanelPicker/`       | Unchanged                                         |
| `panelRegistry`             | `src/features/dashboard/registry/`                     | Unchanged                                         |
| `layoutStore`               | `src/features/dashboard/stores/layoutStore.ts`         | Unchanged                                         |
| `defaultLayouts`            | `src/features/dashboard/registry/defaultLayouts.ts`    | Unchanged                                         |
| `DashboardShell` (partial)  | `src/shared/components/DashboardShell.tsx`             | Rewritten — becomes `AppShell` with new sidebar   |
| `Header` (partial)          | `src/shared/components/Header.tsx`                     | Stripped of nav links, keeps title + robot status |
| All ROS services and stores | `src/services/`, `src/shared/stores/`                  | Unchanged                                         |
| Design system tokens        | `src/styles/`                                          | Unchanged                                         |

### BUILD

| Component          | File                                                 | Description                                                                                                                                                                                                     |
| ------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell`         | `src/shared/components/AppShell.tsx`                 | Replaces `DashboardShell`. Full-height layout: sidebar + header + main outlet                                                                                                                                   |
| `Sidebar`          | `src/shared/components/Sidebar/Sidebar.tsx`          | Fleet list, Map shortcut, Settings, ThemeDropdown. Resizable via `react-resizable-panels` (shadcn Resizable). Width persisted to localStorage via `autoSaveId`. Collapses to icon rail at minimum width (~48px) |
| `SidebarRobotList` | `src/shared/components/Sidebar/SidebarRobotList.tsx` | Renders robot rows with shadcn `Badge` status indicators (green=connected, red=offline, orange=warning). Click row → drill-down to `/robot/:robotId`                                                            |
| `SidebarNavItem`   | `src/shared/components/Sidebar/SidebarNavItem.tsx`   | Reusable nav row (Map, Settings)                                                                                                                                                                                |
| `ThemeDropdown`    | `src/shared/components/Sidebar/ThemeDropdown.tsx`    | Scaffold only — Default Dark theme for now. Sets `document.documentElement.dataset.theme` (NOT class-based)                                                                                                     |
| `MinimalHeader`    | `src/shared/components/MinimalHeader.tsx`            | Replaces `Header`. App title left, active robot name + battery + connection right                                                                                                                               |
| `FleetOverview`    | `src/features/fleet/FleetOverview.tsx`               | Default main content (no robot selected). Replaces `FleetView` page                                                                                                                                             |
| `RobotWorkspace`   | `src/features/robot/RobotWorkspace.tsx`              | Per-robot panel grid. Absorbs `EngineerMode` grid logic. Replaces all 3 mode components. Includes immersive toggle ("Go Fullscreen") that hides sidebar + header via `ui.store.ts immersiveMode`                |
| `SharedMapView`    | `src/features/map/SharedMapView.tsx`                 | Map main content area (placeholder stub — full impl Phase 12)                                                                                                                                                   |

---

## New File Structure

```
src/
  features/
    fleet/
      FleetOverview.tsx            # NEW — main content, no robot selected
      FleetOverview.test.tsx       # NEW
      FleetView.tsx                # DELETED
    robot/
      RobotWorkspace.tsx           # NEW — unified panel grid per robot
      RobotWorkspace.test.tsx      # NEW
      RobotWorkspace.types.ts      # NEW
    map/
      SharedMapView.tsx            # NEW (stub)
      SharedMapView.test.tsx       # NEW
      MapView.tsx                  # DELETED
    dashboard/
      DashboardView.tsx            # DELETED
      DashboardView.test.tsx       # DELETED
      modes/
        DashboardMode/             # DELETED (entire folder)
        PilotMode/                 # DELETED (entire folder)
        EngineerMode/              # DELETED (entire folder)
      components/
        ModeSwitcher/              # DELETED (entire folder)
        PanelFrame/                # KEPT
        PanelPicker/               # KEPT
        TabGroup/                  # KEPT
        EmptyState/                # KEPT
      stores/
        modeStore.ts               # DELETED
        modeStore.types.ts         # DELETED
        layoutStore.ts             # KEPT
      registry/                    # KEPT entirely
      panels/                      # KEPT entirely
      placeholders/                # KEPT entirely
    pilot/
      PilotPickerView.tsx          # DELETED
      PilotView.tsx                # DELETED
      components/                  # KEPT entirely (ControlPad, EStop, etc.)
  shared/
    components/
      AppShell.tsx                 # NEW (replaces DashboardShell.tsx)
      DashboardShell.tsx           # DELETED
      MinimalHeader.tsx            # NEW (replaces Header.tsx)
      Header.tsx                   # DELETED
      Header.types.ts              # DELETED
      BottomTabBar.tsx             # DELETED
      SidebarToggle.tsx            # DELETED or absorbed into Sidebar
      Sidebar/
        Sidebar.tsx                # NEW — uses shadcn ResizablePanel
        SidebarRobotList.tsx       # NEW — shadcn Badge per robot
        SidebarNavItem.tsx         # NEW
        ThemeDropdown.tsx          # NEW (scaffold, data-theme attribute)
        Sidebar.types.ts           # NEW
      Show.tsx                     # KEPT
      NotFoundView.tsx             # KEPT
    stores/
      ui/ui.store.ts               # UPDATE — remove sidebarOpen/toggleSidebar; add immersiveMode: boolean
  router.tsx                       # REWRITTEN — simplified routes
```

---

## New Router Config

```tsx
// src/router.tsx — after redesign
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <FleetOverview /> },
        { path: 'robot/:robotId', element: <RobotWorkspace /> },
        { path: 'map', element: <SharedMapView /> },
      ],
    },
    {
      path: '*',
      element: <NotFoundView />,
    },
  ],
  { basename: '/robot-telemetry-dashboard/' }
);
```

Routes removed: `/dashboard`, `/fleet`, `/pilot`, `/pilot/:robotId`
Routes added: `/robot/:robotId`
Route simplified: `/` now directly renders `FleetOverview` (no redirect)

---

## Migration Plan

### Step 1 — Failing tests (TDD gate)

Write tests first. Nothing passes yet.

- `AppShell` renders with sidebar and no top nav links
- `Sidebar` renders fleet list section, Map item, Settings item
- `MinimalHeader` renders app title, no nav links
- Old routes (`/dashboard`, `/fleet`, `/pilot`) return 404 or redirect
- `/robot/:robotId` renders `RobotWorkspace`
- `/` renders `FleetOverview`
- `modeStore` is gone (import fails or is unused)
- `ModeSwitcher` is gone (import fails or is unused)
- `BottomTabBar` is gone (import fails or is unused)

### Step 2 — Install dependency

```
npx shadcn@latest add resizable badge
```

`react-resizable-panels` is pulled in transitively by the shadcn `resizable` primitive.

### Step 3 — Build new components

In order:

1. `MinimalHeader` — trivial, no deps
2. `ThemeDropdown` stub — sets `document.documentElement.dataset.theme`; scaffold only
3. `SidebarNavItem` — atom
4. `SidebarRobotList` — reads robot list from existing store; shadcn `Badge` per robot
5. `Sidebar` — composes above; uses shadcn `ResizablePanel` + `ResizableHandle`; `autoSaveId="sidebar"` for localStorage width persistence
6. `AppShell` — `ResizablePanelGroup direction="horizontal"`: `[Sidebar][ResizableHandle][main content]`; `MinimalHeader` spans full width above
7. `FleetOverview` — fleet grid view (port content from deleted `FleetView`)
8. `RobotWorkspace` — copy `EngineerMode` grid logic, rename, wire to `:robotId` param;
   use `useElementSize` hook (already exists from ISS-008 fix) on the grid container to feed `WidthProvider` — do NOT use static width
9. `SharedMapView` — stub only (`<p>Map — Phase 12</p>`)
10. Rewrite `router.tsx`
11. Update `ui.store.ts` — remove `sidebarOpen: boolean` and `toggleSidebar`; add `immersiveMode: boolean` with `setImmersiveMode(v: boolean)`. Panel library owns sidebar width state.
12. Before deleting `BottomTabBar.tsx`: grep for `BottomTabBar` in all test files. Update any dependent tests first, then delete.

### Step 3 — Delete removed components

After all tests pass:

- Delete `DashboardView.tsx`, `DashboardView.test.tsx`
- Delete `modes/DashboardMode/`, `modes/PilotMode/`, `modes/EngineerMode/`
- Delete `components/ModeSwitcher/`
- Delete `stores/modeStore.ts`, `stores/modeStore.types.ts`
- Delete `DashboardShell.tsx`, `Header.tsx`, `Header.types.ts`, `BottomTabBar.tsx`, `SidebarToggle.tsx`
- Delete `FleetView.tsx`, `MapView.tsx`
- Delete `PilotPickerView.tsx`, `PilotView.tsx`

### Step 4 — Visual review

Screenshot each state and compare against design intent.

---

## Edge Cases

### No robots connected

- Sidebar robot list shows empty state: "No robots connected"
- `FleetOverview` shows empty state with connection instructions
- `MinimalHeader` right side shows nothing (no active robot)
- `/robot/:robotId` with unknown robotId → renders `RobotWorkspace` with
  "Robot not found" empty state (do not 404 — robot may reconnect)

### Connection loss mid-session

- Sidebar robot row changes to disconnected indicator
- `RobotWorkspace` keeps panels rendered but widgets show `NoConnectionOverlay`
  (existing behavior — `NoConnectionOverlay` component is kept)
- `MinimalHeader` connection badge shows "DISCONNECTED"

### Empty robot workspace

- Fresh robot detail with no panels saved → renders empty grid with prominent
  [+ Add Panel] CTA (same as `EngineerMode` today)

### Sidebar collapsed / very narrow viewport

- When dragged to minimum, sidebar collapses to an icon rail (VS Code/Discord pattern) — a thin
  strip showing only icons: fleet (robot icon), map icon, settings icon. No labels.
- Icon rail width: ~48px. Full sidebar default: 256px. Max: 400px.
- `react-resizable-panels` controls the width. Set `minSize` to correspond to ~48px icon rail.
- Width persists to localStorage via `autoSaveId="sidebar"`.
- Mobile is out of scope for this phase. No hamburger toggle required.

### Deep link to `/robot/:robotId`

- App loads with correct robot pre-selected in sidebar
- `MinimalHeader` immediately shows that robot's name + status
- `RobotWorkspace` loads saved layout for that robot (keyed by robotId in `layoutStore`)

### Layout persistence across robots

- `layoutStore` currently keys layouts by mode name (`'engineer'`, `'dashboard'`)
- In new IA, layouts must be keyed by robotId
- **Decision:** start fresh — do NOT import or clone the old `'engineer'` layout.
  Each robot opens with `defaultLayouts.robot` (a new default defined in `defaultLayouts.ts`).
  Subsequent saves are keyed by robotId. Old `'engineer'` and `'dashboard'` localStorage
  keys are ignored and can be pruned.

---

## `RobotWorkspace` — Key Design Decisions

This component absorbs `EngineerMode`. Key changes:

1. **Props:** receives `robotId: string` (from `useParams`)
2. **Layout key:** uses `robotId` in `layoutStore` instead of `'engineer'`
3. **Grid width — CRITICAL:** `WidthProvider` from react-grid-layout measures the DOM element
   on mount but does not respond to sidebar resize. When the resizable sidebar changes width,
   the grid container width changes but the grid does not recompute column widths → broken layout.
   **Solution:** do NOT use `WidthProvider`. Instead use `useElementSize` hook (already in the
   codebase from the ISS-008 fix) on the grid container ref, and pass `width` directly to
   `ReactGridLayout`. This makes the grid reactive to ResizeObserver events.
4. **Control panels:** `ControlPad`, `EStop`, `VelocitySliders` are panel registry entries,
   draggable and closable — no dedicated Pilot mode needed
5. **Immersive toggle:** a "Go Fullscreen" button in the `RobotWorkspace` toolbar hides the
   sidebar and `MinimalHeader`, giving a clean fullscreen control surface (replaces the old
   standalone `PilotView` route). Press Escape or a visible "Exit" button to return.
   Implemented via `immersiveMode: boolean` in `ui.store.ts`. `AppShell` reads this flag
   and conditionally renders sidebar + header.
6. **No mobile guard:** `EngineerMode` bailed on mobile. `RobotWorkspace` is desktop-only
   for this phase (mobile redesign is Phase 9+), so keep the same guard
7. **Panel registry:** unchanged. All existing panels remain available.

---

## Acceptance Criteria

### Structure

- [ ] One navigation surface: sidebar only. No top nav links. No bottom tab bar. No mode switcher.
- [ ] Sidebar visible on all routes
- [ ] `MinimalHeader` shows app title on left; active robot name + battery + connection on right
- [ ] `MinimalHeader` shows no nav links

### Routes

- [ ] `/` renders `FleetOverview`
- [ ] `/robot/:robotId` renders `RobotWorkspace` for that robot
- [ ] `/map` renders `SharedMapView`
- [ ] `/dashboard`, `/fleet`, `/pilot`, `/pilot/:robotId` return 404 or redirect to `/`
- [ ] Deep link to `/robot/some-id` works on fresh load

### Sidebar

- [ ] Fleet section lists robots with shadcn `Badge` status indicators (green/red/orange)
- [ ] Empty fleet state renders "No robots connected"
- [ ] Map nav item navigates to `/map`
- [ ] Settings nav item present (can be no-op stub this phase)
- [ ] ThemeDropdown present (scaffold only — one option: Default Dark)
- [ ] ThemeDropdown sets `document.documentElement.dataset.theme` (not a CSS class)
- [ ] Sidebar width is draggable via `react-resizable-panels` ResizableHandle
- [ ] Sidebar width persists across page reloads (localStorage via `autoSaveId`)
- [ ] Sidebar collapses to icon rail (~48px) at minimum — never fully hidden
- [ ] Clicking a robot navigates to `/robot/:robotId`
- [ ] Active robot is highlighted in sidebar

### RobotWorkspace

- [ ] Panel grid renders (react-grid-layout)
- [ ] Grid width responds to sidebar resize (uses `useElementSize`, NOT `WidthProvider`)
- [ ] [+ Add Panel] toolbar button opens `PanelPicker`
- [ ] Panels draggable, resizable, closable
- [ ] Layout saved per robotId (not per mode)
- [ ] Layout resets to default when "Reset" triggered
- [ ] "Go Fullscreen" button hides sidebar + header (`immersiveMode = true`)
- [ ] Escape key and "Exit" button restore sidebar + header (`immersiveMode = false`)
- [ ] Fresh robot workspace opens with `defaultLayouts.robot` (not a clone of old `'engineer'` layout)

### Removed items

- [ ] No `<nav>` with Dashboard/Fleet/Map links in header
- [ ] No mode switcher (DASHBOARD | PILOT | ENGINEER)
- [ ] No bottom tab bar on any viewport
- [ ] `modeStore` not imported anywhere in the app
- [ ] `ModeSwitcher` component not imported anywhere in the app

### View-level integration tests

- [ ] `AppShell` snapshot: sidebar + header + outlet, no BottomTabBar
- [ ] Navigate to `/` → `FleetOverview` renders
- [ ] Navigate to `/robot/bot-1` → `RobotWorkspace` renders with robot context
- [ ] Navigate to `/map` → `SharedMapView` renders
- [ ] Sidebar robot click → URL changes to `/robot/:id`
- [ ] `modeStore` import causes TypeScript error (file deleted)

---

## Out of Scope (This Phase)

- WebRTC video implementation (Phase 9)
- SLAM map implementation (Phase 12)
- Fleet management features (Phase 11)
- Theme variations (OLED Black, Military Green, Ocean Blue) — scaffold dropdown only
- Mobile sidebar redesign — focus is desktop sidebar layout
- Robot dot click-through on map → robot detail
- AI features

---

## Resolved Decisions (from Research)

All open questions from the DRAFT are now closed:

1. **Sidebar resize implementation:** use `react-resizable-panels` (shadcn Resizable).
   `autoSaveId="sidebar"` for localStorage persistence. Install: `npx shadcn@latest add resizable`.

2. **Fleet list status indicators:** shadcn `Badge` — green=connected, red=offline, orange=warning.
   Install: `npx shadcn@latest add badge`.

3. **Multi-theme strategy:** `data-theme` attribute on `<html>` + CSS custom properties per theme.
   NOT class-based. `document.documentElement.dataset.theme = "navy"`. Scaffold only this phase.

4. **Grid width with resizable sidebar:** do NOT use `WidthProvider`. Use `useElementSize`
   (ResizeObserver) on the grid container ref, pass `width` directly to `ReactGridLayout`.
   This is the same pattern we already use from the ISS-008 fix.

5. **Router pattern confirmed:** React Router v7 nested routes with `<Outlet />`.
   `AppShell` is the layout route — sidebar stays mounted while children swap via Outlet.

6. **Sidebar collapse on narrow desktop:** icon rail pattern (VS Code/Discord style). When
   dragged to minimum (~48px), sidebar shows icons only — no labels. Full width default 256px.
   `react-resizable-panels` enforces min. Mobile out of scope for Phase 8.

7. **Layout key migration:** start fresh. Do NOT import or clone the old `'engineer'` layout.
   Each robot opens with `defaultLayouts.robot`. Old localStorage keys ignored.

8. **`PilotView` standalone route:** replaced by an immersive toggle inside `RobotWorkspace`.
   "Go Fullscreen" hides sidebar + header. Escape / "Exit" button restores. No separate route.
   `ui.store.ts` gains `immersiveMode: boolean`.

9. **`BottomTabBar` deletion:** IS being removed. Check test files for dependencies on
   `BottomTabBar` before deleting — update any dependent tests first.
