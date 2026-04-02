# Roadmap: Robot Telemetry Dashboard v4

## Overview

Five polished features deliver a portfolio-ready robot telemetry dashboard. Polish over breadth — each feature is complete and visually verified before moving to the next. Built freeform with pair programming and checkpoints, not formal GSD ceremony.

## Build Order

### Foundation (complete)

- [x] **Scaffolding** — Vite 7, React 19, TypeScript 5.9, test infra, deps verified
- [x] **Design System** — Midnight Operations (OKLCH hue 260), Exo + Roboto Mono, Lucide icons, @theme inline, dark/light
- [x] **App Shell** — Collapsible sidebar (200px ↔ 48px), header, statusbar, mobile drawer, dark-first theme toggle
- [x] **Folder Structure** — Feature-domain organization, CLAUDE.md conventions, DESIGN-SYSTEM.md reference

### Features

- [x] **Landing Page** — CX2-inspired hero, features section, problem/solution, CTA, footer. Standalone page outside AppShell, forces dark theme.
- [x] **Fleet + Robot Management** — Robot cards with shadcn Card, subcomponents (Identity, Connection, Vitals, Graph, Actions, DataRow), Add Robot modal, store-driven sidebar, empty state, robot color system, Pilot button, system diagnostics on card.
- [x] **Robot Workspace** — 3×2 grid at /robot/:id with 6 production panels (Camera, LiDAR, System Status, IMU, Controls, Telemetry). Minimize/maximize with dock bar, dynamic grid reflow. Each panel handles own connected/disconnected state. Canvas 2D for LiDAR/IMU/Telemetry, theme-aware redraw. **Needs: real roslib wiring, WebRTC camera stream.**
- [x] **Controls** — E-Stop, D-pad (press-and-hold continuous publishing at 10Hz), velocity sliders, disabled when disconnected, keyboard support (arrow keys + Escape). useControlPublisher hook in src/hooks/.
- [x] **Mockups Page** — Living design system reference at /mockups with live token swatches, component gallery, workspace panels with mock data.

### Cross-Cutting (ongoing)

- [x] **Code Quality Pass 1** — shadcn component adoption, WCAG AA contrast, canonical Tailwind classes, three-tier boundary enforcement
- [x] **Folder Restructure** — Eliminated src/shared/, features use components/types/mocks/ subfolders, @/ import aliases enforced
- [x] **Convention Enforcement** — eslint-plugin-jsx-a11y, eslint-plugin-jsdoc, validate-structure.sh, semantic HTML, typography mapping, Google JSDoc style
- [x] **Component Refactors** — ConditionalRender utility, RobotCard → shadcn Card + 6 subcomponents, AppShell backdrop a11y fix, NotFound/ComingSoon extracted

### Routes Added

- `/fleet` — Fleet overview
- `/robot/:id` — Robot workspace (functional)
- `/pilot/:id` — Pilot mode (ComingSoon placeholder)
- `/demo` — Demo mode (routes to FleetOverview, pending real implementation)
- `/map` — Map view (ComingSoon placeholder)
- `/settings` — Settings (ComingSoon placeholder)
- `/dev/components` — Component reference viewer
- `/dev/workspace` — Workspace mock preview
- `*` — 404 NotFound page

### Deferred (can add later)

- System Status inline expand (click nodes/topics/services/actions counts to see lists)
- Demo Mode (/demo route with 3-4 mock robots streaming at 10Hz, DEMO MODE badge in header, same components as production, clean mount/unmount lifecycle)
- Pilot Mode (/pilot/:id with camera HUD overlay, first-person robot control, LiDAR minimap, velocity controls)
- Map View (/map with occupancy grid via Web Worker)
- Settings page
- Auth + RBAC (JWT, robot-scoped permissions, separate read/write hooks)
- Responsive: two modes only — Desktop (>=1024px) and Mobile (<1024px). Separate component variants to avoid responsive bloat.
- Fleet grouping: mission groups or custom tags, filterable fleet view, group health rollup
- Customizable panels: add/remove panels from workspace per robot
- Rearrangeable panels: drag-and-drop reordering, persist layout per robot
- Refactor Sidebar to use shadcn Sidebar component
- Refactor Header breadcrumb to use shadcn Breadcrumb component
- Register ui-ux-pro-max as callable skill
- First-time user tour guide / onboarding walkthrough (fleet → workspace → controls)
- Button + Badge a11y contrast audit (WCAG compliance, light/dark, all variants)
- Header brand link (links to /fleet in AppShell, / on landing page)
- Landing page: roadmap/what's next section, docs links, rosbridge setup instructions
- Fleet card: move trash icon to top-right corner of card

## Process

- **Execution:** Freeform pair programming. Discuss → research (ui-ux-pro-max, context7, /frontend-design) → build → checkpoint.
- **Tracking:** This ROADMAP + STATE.md updated after each feature.
- **Vertical features:** Each feature built end-to-end (types → store → hook → component → tests → verify) before starting the next.
- **Visual verification:** Playwright MCP screenshot before every checkpoint. Code that compiles is not code that looks right.
- **Design process:** MUST consult /frontend-design or ui-ux-pro-max BEFORE any visual component work. No exceptions.

## Progress

| Feature             | Status      | Completed  |
| ------------------- | ----------- | ---------- |
| Scaffolding         | ✅ Complete | 2026-03-25 |
| Design System       | ✅ Complete | 2026-03-28 |
| App Shell           | ✅ Complete | 2026-03-28 |
| Folder Structure    | ✅ Complete | 2026-03-28 |
| Landing Page        | ✅ Complete | 2026-03-29 |
| Fleet + Robot Mgmt  | ✅ Complete | 2026-03-29 |
| Code Quality Pass 1 | ✅ Complete | 2026-03-29 |
| Folder Restructure  | ✅ Complete | 2026-03-29 |
| Convention Enforce  | ✅ Complete | 2026-03-30 |
| Component Refactors | ✅ Complete | 2026-03-30 |
| Polish Sweep        | ✅ Complete | 2026-03-30 |
| Workspace Panels    | ✅ Complete | 2026-03-31 |
| Controls            | ✅ Complete | 2026-03-31 |
| Mockups Page        | ✅ Complete | 2026-04-01 |

## Backlog
- [ ] Add LLM chat interface to dashboard for robot interaction/diagnostics
