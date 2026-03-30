# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** A working, visually polished robot telemetry dashboard that connects to real ROS2 robots and looks like it belongs at a defense contractor.

## Current Position

**Next:** Wire real roslib connections into workspace panels, or build Demo Mode
**Status:** Workspace grid built with mocks, conventions enforced, ready for real data layer
**Branch:** EPIC/v4-rebuild

## Completed Work

| Feature             | Key Commits          | What was built                                                                                                                        |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Scaffolding         | `aa6602e`            | Vite 7, React 19, TypeScript 5.9, ESLint, Prettier, shadcn, roslib smoke test                                                         |
| Design System       | `1225783`, `7214a9e` | Midnight Operations OKLCH tokens, @theme inline, dark/light themes, Lucide React                                                      |
| App Shell           | `dc82a8e`            | Collapsible sidebar, header with breadcrumb, statusbar, mobile drawer, dark-first theme                                               |
| Conventions         | `b99243f`, `51d4d40` | CLAUDE.md rules, DESIGN-SYSTEM.md, FOLDER-STRUCTURE.md, TESTING.md                                                                    |
| Landing Page        | `371bcbd`            | CX2-inspired hero, features, problem/solution, CTA, footer                                                                            |
| Fleet + Robot Mgmt  | `baa673f`, `5e7b056` | Connection store, RobotCard (shadcn Card + 6 subcomponents), AddRobotModal, FleetEmptyState, Pilot button, system diagnostics on card |
| Robot Workspace     | `4539f9a`            | 3×2 grid, WorkspacePanel with dock, 6 mock panels, IMU variant selector, dev views                                                    |
| Code Quality        | `316d750`–`d007c8b`  | eslint-plugin-boundaries, jsx-a11y, jsdoc, shadcn adoption, WCAG AA, validate-structure.sh                                            |
| Folder Restructure  | `4539f9a`, `d007c8b` | Eliminated src/shared/, features use components/types/mocks/, @/ import aliases                                                       |
| Convention Enforce  | `04e1c39`+           | Google JSDoc style, semantic HTML, ConditionalRender, types/ folders, design process hook                                             |
| Component Refactors | (uncommitted)        | RobotCard → shadcn Card + subcomponents, AppShell a11y fix, NotFound/ComingSoon extracted                                             |

## Decisions (this rebuild)

- Palette D "Midnight Operations" — OKLCH hue 260, accent hue 230
- Fonts: Exo (UI) + Roboto Mono (telemetry)
- Icons: Lucide React
- Sidebar: Collapsible toggle (200px ↔ 48px), Pilot nav item added
- Mobile: Drawer-only, no bottom tab bar
- Theme: Dark-first (ignores system preference, defaults to dark)
- shadcn-first for components (Button, Input, Badge, Card, Dialog, Select, Popover installed)
- Three-tier architecture: src/\* → Features → App (enforced by eslint-plugin-boundaries)
- Feature folders: components/ for UI, types/ for interfaces, mocks/ for dev views, constants.ts/helpers.ts at root
- Types in feature types/ folder, never inline or co-located with components
- ConditionalRender component replaces {condition && <X />} patterns
- Header spans full width above sidebar
- Design process hook enforces /frontend-design consultation before visual changes

## Process Rules

- GSD for tracking only (this file + ROADMAP.md)
- Freeform pair programming for execution
- Research tools FIRST (ui-ux-pro-max, context7, /frontend-design) — enforced by PreToolUse hook
- Discuss design BEFORE implementing — no exceptions for "small" changes
- Google JS Style Guide for JSDoc docstrings (verb phrases, @param, @returns, 100 char wrap)
- Vertical feature development (types → store → hook → component → tests → verify)
- Checkpoint after every feature
- Playwright MCP for testing only, not for showing progress

## Session Continuity

Last session: 2026-03-30
Stopped at: All work committed (1f831cd). 9 tasks planned for next session.

### Next Session Tasks

1. Finalize file structure (RobotCard types — consolidate or keep granular?)
2. JSDoc format — add @description tag + component name to all docstrings
3. Fleet card — move trash icon to top-right corner (needs /frontend-design)
4. Landing page — add roadmap/what's next, docs, rosbridge instructions (needs /frontend-design)
5. Tour guide — add to deferred roadmap
6. In-depth panel design for /robot/:id — design all 6 panels (needs /frontend-design)
7. Ternary extraction rule — multi-line branches become named components
8. Final audit of src/components/ (non-ui)
9. Button + Badge a11y contrast audit — WCAG compliance in light/dark for all variants in /dev/components

### Workspace Design Decisions

| Decision      | Choice                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| Layout        | 3×2 functional grid (Camera, LiDAR, Status / IMU, Controls, Telemetry)    |
| Panel headers | With controls (collapse, fullscreen, topic selector)                      |
| Tick marks    | None                                                                      |
| Empty states  | Unified message per panel when disconnected                               |
| System Status | Full diagnostics (identity + vitals + computation graph counts)           |
| IMU Attitude  | Attitude indicator + Compass heading, user-selectable via footer dropdown |
| Raw Topics    | Removed — absorbed into System Status inline expand (deferred)            |
| Telemetry     | Time-series chart for trends over time                                    |
| Controls      | E-Stop + velocity mock in grid                                            |
