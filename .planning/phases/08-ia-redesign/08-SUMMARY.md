# Phase 8: IA Redesign — Summary

## What Changed

Replaced the multi-nav, multi-mode architecture with a single sidebar-driven paradigm.

### Added

- **AppShell**: ResizablePanel sidebar + MinimalHeader + Outlet
- **Sidebar**: Fleet robot list, Map nav, ThemeDropdown, Settings button, icon-like rail at min-width
- **FleetOverview**: Robot cards with status badges at `/`
- **RobotWorkspace**: Customizable panel grid keyed by `robotId` at `/robot/:id`
- **MinimalHeader**: Title-only header, no nav links
- **SidebarNavItem, SidebarRobotList, ThemeDropdown**: Sidebar sub-components
- **NotFoundView**: Catch-all 404 route

### Removed from active router

- Header nav links (Dashboard | Fleet | Map)
- ModeSwitcher (DASHBOARD | PILOT | ENGINEER)
- BottomTabBar (mobile)
- DashboardShell (old layout wrapper)
- Three-mode component routing (DashboardMode, PilotMode, EngineerMode)

### Router simplification

```
/                    -> FleetOverview
/robot/:robotId      -> RobotWorkspace
/map                 -> SharedMapView
```

## Quality Gate

- Lint: clean
- TypeScript: clean
- Tests: 57 files, 468 passing
- Build: successful (531 kB JS bundle)

## Visual Review Scores

| Dimension          | Score | Notes                                                        |
| ------------------ | ----- | ------------------------------------------------------------ |
| AI Slop            | 7/10  | Purposeful layout; min-width clips text instead of icon rail |
| Defense Aesthetic  | 8/10  | Dark theme, monospace header, tactical panel headers         |
| Navigation Clarity | 8/10  | Single sidebar paradigm, no duplicate navbars                |

## Known Follow-ups

1. Dead code cleanup: ModeSwitcher, BottomTabBar, DashboardShell, DashboardView files still exist but unreachable
2. True icon rail collapse state (vs. text clipping at minimum sidebar width)
3. Mobile responsive breakpoint to hide sidebar / show hamburger menu
