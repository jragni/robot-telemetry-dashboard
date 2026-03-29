# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** A working, visually polished robot telemetry dashboard that connects to real ROS2 robots and looks like it belongs at a defense contractor.

## Current Position

**Next feature:** Robot Workspace
**Status:** Design complete, ready to build
**Branch:** EPIC/v4-rebuild

## Completed Work

| Feature            | Key Commits          | What was built                                                                                                                                                                       |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scaffolding        | `aa6602e`            | Vite 7, React 19, TypeScript 5.9, ESLint, Prettier, shadcn, roslib smoke test                                                                                                        |
| Design System      | `1225783`, `7214a9e` | Midnight Operations OKLCH tokens, @theme inline, dark/light themes, Lucide React                                                                                                     |
| App Shell          | `dc82a8e`            | Collapsible sidebar, header with RTD brand, statusbar, mobile drawer, useTheme hook                                                                                                  |
| Conventions        | `b99243f`, `51d4d40` | CLAUDE.md rules, DESIGN-SYSTEM.md, feature-domain folder structure                                                                                                                   |
| Landing Page       | `371bcbd`            | CX2-inspired hero, features (Pilot Mode, Fleet, Telemetry, Multi-Robot), Problem/Solution, CTA, footer with © jragni 2026, GSAP installed                                            |
| Fleet + Robot Mgmt | `baa673f`            | Connection store (Zustand + persist), RobotCard folder (3 subcomponents), AddRobotModal with URL transform, FleetEmptyState, store-driven sidebar, /dev/components viewer            |
| Code Quality       | `316d750`–`279ae43`  | eslint-plugin-boundaries (three-tier enforcement), shadcn Button/Input/Badge/Card, canonical Tailwind classes, WCAG AA contrast fix, constants extraction, validate-structure script |

## Decisions (this rebuild)

- Palette D "Midnight Operations" — OKLCH hue 260, accent hue 230
- Fonts: Exo (UI) + Roboto Mono (telemetry) — replaced Fira family
- Icons: Lucide React — replaced text characters
- Sidebar: Collapsible toggle (200px ↔ 48px), no resizable drag
- Mobile: Drawer-only, no bottom tab bar
- Theme: Dark-first (ignores system preference, defaults to dark)
- App name: "Robot Telemetry Dashboard" / RTD on mobile
- No decorative elements without purpose
- shadcn-first for components (Button, Input, Badge, Card, Dialog installed)
- Three-tier architecture: Shared → Features → App (enforced by eslint-plugin-boundaries)
- Constants in .constants.ts files, never inline in components
- CLAUDE.md references docs (DESIGN-SYSTEM.md, FOLDER-STRUCTURE.md, TESTING.md) instead of duplicating rules

## Process Rules

- GSD for tracking only (this file + ROADMAP.md)
- Freeform pair programming for execution
- Research tools FIRST (ui-ux-pro-max, context7, /frontend-design)
- Apply research findings when coding — don't ignore them
- Vertical feature development (types → store → hook → component → tests → verify)
- Checkpoint after every component
- Verify visually (Playwright MCP) before presenting to user
- Pre-write checklist in CLAUDE.md before every component

## Session Continuity

Last session: 2026-03-29
Stopped at: Workspace design complete — 3×2 layout (C), folder restructure done, dev view with layout comparison live

### Workspace Design Decisions

| Decision      | Choice                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| Layout        | 3×2 functional grid (Camera, LiDAR, Status / IMU, Controls, Telemetry)            |
| Panel headers | With controls (collapse, fullscreen, topic selector)                              |
| Tick marks    | None                                                                              |
| Empty states  | Unified message per panel when disconnected                                       |
| System Status | Full diagnostics (identity + vitals + computation graph counts)                   |
| IMU Attitude  | Attitude indicator + Compass heading (side by side), user-selectable via dropdown |
| Raw Topics    | Removed — absorbed into System Status inline expand (deferred)                    |
| Telemetry     | Time-series chart for trends over time                                            |
| Controls      | E-Stop + velocity, placeholder in grid                                            |
