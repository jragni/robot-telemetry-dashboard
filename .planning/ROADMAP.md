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
- [ ] **Robot Workspace** — CSS Grid 2×3 panel layout, telemetry widgets (IMU, charts, LiDAR, camera, raw values), dark panels with surface glow, context-aware empty states.
- [ ] **Controls** — E-Stop (always reachable), velocity D-pad + sliders, control panel in workspace, command publishing.
- [ ] **Demo Mode** — /demo route with 3-4 mock robots streaming at 10Hz, DEMO MODE badge in header, same components as production, clean mount/unmount lifecycle.

### Deferred (can add later)

- Pilot View (/pilot/:id with camera HUD overlay)
- Map View (/map with occupancy grid via Web Worker)
- Settings page
- Topic discovery panel
- Mobile responsive carousel for workspace

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
| Fleet + Robot Mgmt | Not started | —          |
| Robot Workspace    | Not started | —          |
| Controls           | Not started | —          |
| Demo Mode          | Not started | —          |
