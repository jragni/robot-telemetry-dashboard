# Roadmap: Robot Telemetry Dashboard v4

## Overview

Five polished features deliver a portfolio-ready robot telemetry dashboard. Polish over breadth — each feature is complete and visually verified before moving to the next. Built freeform with pair programming and checkpoints, not formal GSD ceremony.

## Build Order

### Foundation (complete)

- [x] **Scaffolding** — Vite 7, React 19, TypeScript 5.9, test infra, deps verified
- [x] **Design System** — Midnight Operations (OKLCH hue 260), Exo + Roboto Mono, Lucide icons, @theme inline, dark/light
- [x] **App Shell** — Collapsible sidebar (200px ↔ 48px), header, statusbar, mobile drawer, dark-first theme toggle
- [x] **Folder Structure** — Feature-domain organization, CLAUDE.md conventions, DESIGN-SYSTEM.md reference

### Features (in order)

- [ ] **Landing Page** — Vast-esque hero with live mock dashboard widgets, product copy, CTAs (/fleet, /demo), feature cards. Standalone page outside AppShell, forces dark theme.
- [ ] **Fleet + Robot Management** — Robot cards grid, Add Robot modal with URL transform, store-driven sidebar, empty state with CTA, no auto-connect on startup.
- [ ] **Robot Workspace** — 3×2 functional grid at /robot/:id. Top row: Camera, LiDAR, System Status. Bottom row: IMU Attitude (attitude indicator + compass), Controls, Telemetry Chart. Panel headers with controls (collapse, fullscreen, topic selector). No tick marks. Unified empty state when disconnected. System Status shows identity + vitals + computation graph (nodes/topics/services/actions via roslib).
- [ ] **Controls** — E-Stop (always reachable), velocity D-pad + sliders, lives inside workspace grid, command publishing.
- [ ] **Demo Mode** — /demo route with 3-4 mock robots streaming at 10Hz, DEMO MODE badge in header, same components as production, clean mount/unmount lifecycle.

### Deferred (can add later)

- System Status inline expand (click nodes/topics/services/actions counts to see lists)
- Pilot View (/pilot/:id with camera HUD overlay)
- Map View (/map with occupancy grid via Web Worker)
- Settings page
- Auth + RBAC (JWT, robot-scoped permissions, separate read/write hooks)
- Responsive: two modes only — Desktop (>=1024px, full dashboard grid) and Mobile (<1024px, simplified UI for tablet + phone). Sidebar toggle to force desktop/mobile view override. Separate mobile and desktop component variants (e.g., `WorkspaceGrid` vs `WorkspaceGridMobile`) to avoid responsive bloat in a single component — shared logic via hooks, divergent UI via separate renders.
- Fleet grouping: mission groups or custom tags to organize robots (e.g., "Warehouse A", "Patrol Team 2"), filterable fleet view, group health rollup
- Customizable panels: add/remove panels from workspace, choose which widgets to display per robot
- Rearrangeable panels: drag-and-drop reordering of workspace panels, persist layout per robot
- 404/catch-all route: handle invalid or non-existing routes with a proper not-found page

## Process

- **Execution:** Freeform pair programming. Discuss → research (ui-ux-pro-max, context7, /frontend-design) → build → checkpoint.
- **Tracking:** This ROADMAP + STATE.md updated after each feature.
- **Vertical features:** Each feature built end-to-end (types → store → hook → component → tests → verify) before starting the next.
- **Visual verification:** Playwright MCP screenshot before every checkpoint. Code that compiles is not code that looks right.

## Progress

| Feature            | Status      | Completed  |
| ------------------ | ----------- | ---------- |
| Scaffolding        | ✅ Complete | 2026-03-25 |
| Design System      | ✅ Complete | 2026-03-28 |
| App Shell          | ✅ Complete | 2026-03-28 |
| Folder Structure   | ✅ Complete | 2026-03-28 |
| Landing Page       | ✅ Complete | 2026-03-29 |
| Fleet + Robot Mgmt | ✅ Complete | 2026-03-29 |
| Robot Workspace    | Not started | —          |
| Controls           | Not started | —          |
| Demo Mode          | Not started | —          |
