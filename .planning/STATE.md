# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** A working, visually polished robot telemetry dashboard that connects to real ROS2 robots and looks like it belongs at a defense contractor.

## Current Position

**Next feature:** Fleet + Robot Management
**Status:** Ready to start
**Branch:** EPIC/v4-rebuild

## Completed Work

| Feature       | Key Commits          | What was built                                                                      |
| ------------- | -------------------- | ----------------------------------------------------------------------------------- |
| Scaffolding   | `aa6602e`            | Vite 7, React 19, TypeScript 5.9, ESLint, Prettier, shadcn, roslib smoke test       |
| Design System | `1225783`, `7214a9e` | Midnight Operations OKLCH tokens, @theme inline, dark/light themes, Lucide React    |
| App Shell     | `dc82a8e`            | Collapsible sidebar, header with RTD brand, statusbar, mobile drawer, useTheme hook |
| Conventions   | `b99243f`, `51d4d40` | CLAUDE.md rules, DESIGN-SYSTEM.md, feature-domain folder structure                  |

## Decisions (this rebuild)

- Palette D "Midnight Operations" — OKLCH hue 260, accent hue 230
- Fonts: Exo (UI) + Roboto Mono (telemetry) — replaced Fira family
- Icons: Lucide React — replaced text characters
- Sidebar: Collapsible toggle (200px ↔ 48px), no resizable drag
- Mobile: Drawer-only, no bottom tab bar
- Theme: Dark-first (ignores system preference, defaults to dark)
- App name: "Robot Telemetry Dashboard" / RTD on mobile
- No decorative elements without purpose

## Process Rules

- GSD for tracking only (this file + ROADMAP.md)
- Freeform pair programming for execution
- Research tools FIRST (ui-ux-pro-max, context7, /frontend-design)
- Apply research findings when coding — don't ignore them
- Vertical feature development (types → store → hook → component → tests → verify)
- Checkpoint after every component
- Verify visually (Playwright MCP) before presenting to user

## Session Continuity

Last session: 2026-03-28
Stopped at: Foundation complete, ready for Landing Page feature
