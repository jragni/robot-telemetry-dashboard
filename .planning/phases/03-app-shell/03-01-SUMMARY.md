# Phase 3: App Shell & Routing -- Summary

## Date

2026-03-20

## What Was Done

1. **React Router Setup** -- `src/router.tsx` with `createBrowserRouter` and `basename: '/robot-telemetry-dashboard/'`:
   - `/` redirects to `/dashboard`
   - `/dashboard`, `/fleet`, `/map`, `/pilot` inside DashboardShell
   - `/pilot/:robotId` fullscreen (outside shell)
   - `*` catches 404s

2. **DashboardShell** -- `src/shared/components/DashboardShell.tsx`:
   - Header (h-12) + collapsible sidebar (w-64/w-0) + main content (`<Outlet />`)
   - Sidebar uses `w-0` collapse (not translate -- prevents flex space issue from v2 ISS)
   - Mobile main content gets `pb-14` to prevent bottom bar overlap
   - SidebarToggle strip between sidebar and content

3. **Header** -- Desktop nav links (Dashboard, Fleet, Map) with NavLink active state. Hidden on mobile via `<Show>`.

4. **BottomTabBar** -- 4 tabs (Dashboard, Fleet, Map, Pilot) with lucide icons. Fixed bottom, mobile only. Hidden during `/pilot/:robotId` (v2 lesson).

5. **SidebarToggle** -- Thin vertical strip with Menu/X icon, controls sidebar via UI store.

6. **UI Store** -- `src/shared/stores/ui/ui.store.ts` with Zustand. Sidebar open/close state, no persistence.

7. **useMobile Hook** -- `src/shared/hooks/use-mobile.ts` using `matchMedia` for `<768px` detection.

8. **Placeholder Views** -- 5 views in `src/features/`:
   - `dashboard/DashboardView.tsx`
   - `fleet/FleetView.tsx`
   - `map/MapView.tsx`
   - `pilot/PilotPickerView.tsx`
   - `pilot/PilotView.tsx` (fullscreen, shows robotId)

9. **NotFoundView** -- 404 page with link back to dashboard.

10. **App.tsx** -- Wired to `<RouterProvider router={router} />`.

## Quality Gate

| Check      | Result               |
| ---------- | -------------------- |
| ESLint     | 0 errors, 0 warnings |
| TypeScript | 0 errors             |
| Tests      | 38 passed (9 files)  |
| Build      | Success (737ms)      |

## Components

| Component       | File                                       |
| --------------- | ------------------------------------------ |
| DashboardShell  | `src/shared/components/DashboardShell.tsx` |
| Header          | `src/shared/components/Header.tsx`         |
| BottomTabBar    | `src/shared/components/BottomTabBar.tsx`   |
| SidebarToggle   | `src/shared/components/SidebarToggle.tsx`  |
| NotFoundView    | `src/shared/components/NotFoundView.tsx`   |
| DashboardView   | `src/features/dashboard/DashboardView.tsx` |
| FleetView       | `src/features/fleet/FleetView.tsx`         |
| MapView         | `src/features/map/MapView.tsx`             |
| PilotPickerView | `src/features/pilot/PilotPickerView.tsx`   |
| PilotView       | `src/features/pilot/PilotView.tsx`         |

## Routes

| Path              | Component       | Layout         |
| ----------------- | --------------- | -------------- |
| `/`               | Redirect        | -> /dashboard  |
| `/dashboard`      | DashboardView   | DashboardShell |
| `/fleet`          | FleetView       | DashboardShell |
| `/map`            | MapView         | DashboardShell |
| `/pilot`          | PilotPickerView | DashboardShell |
| `/pilot/:robotId` | PilotView       | Fullscreen     |
| `*`               | NotFoundView    | Standalone     |

## Files Changed

- `src/App.tsx` -- RouterProvider integration
- `src/router.tsx` -- Route definitions
- `src/shared/components/DashboardShell.tsx` + test
- `src/shared/components/Header.tsx` + `.types.ts` + test
- `src/shared/components/BottomTabBar.tsx` + `.types.ts` + test
- `src/shared/components/SidebarToggle.tsx` + `.types.ts`
- `src/shared/components/NotFoundView.tsx`
- `src/shared/stores/ui/ui.store.ts` + `.types.ts` + test
- `src/shared/hooks/use-mobile.ts`
- `src/features/dashboard/DashboardView.tsx`
- `src/features/fleet/FleetView.tsx`
- `src/features/map/MapView.tsx`
- `src/features/pilot/PilotPickerView.tsx`
- `src/features/pilot/PilotView.tsx`
- `e2e/navigation.spec.ts`
- `e2e/responsive-shell.spec.ts`
- `e2e/smoke.spec.ts` (updated for router)
