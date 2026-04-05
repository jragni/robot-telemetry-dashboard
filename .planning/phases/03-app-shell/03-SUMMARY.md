# Phase 03: App Shell

**Status:** Complete
**Completed:** 2026-03-28
**Key commits:** `dc82a8e`, `f4290d2`

## What was built

- Collapsible sidebar (200px expanded, 48px collapsed)
- Header with breadcrumb navigation and theme toggle
- Status bar at bottom of viewport
- Mobile drawer for sidebar on small screens
- Dark-first theme rendering with smooth transitions
- React Router integration with layout routes

## Key decisions

- Sidebar collapses to icon-only rail rather than fully hiding
- Mobile uses drawer overlay instead of persistent sidebar
- Theme toggle in header for quick access
- Layout uses CSS Grid for predictable panel sizing
