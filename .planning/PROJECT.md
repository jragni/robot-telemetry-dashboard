# Robot Telemetry Dashboard

## What This Is

A browser-based command and control interface for monitoring and operating ROS2 robots. Connects to robots via rosbridge WebSocket, displays live telemetry (IMU, LiDAR, data plots), provides direct control (E-Stop, velocity, D-pad), and renders occupancy grid maps. Supports simultaneous multi-robot operation with a fleet-first navigation model. Built with a defense-contractor aesthetic (Anduril/Palantir-inspired) with light and dark theme options.

## Core Value

A working, visually polished robot telemetry dashboard that connects to real ROS2 robots and looks like it belongs at a defense contractor — not like AI-generated slop. Resume-worthy quality.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Real-time ROS2 connection via rosbridge WebSocket
- [ ] Fleet overview with robot cards showing connection status
- [ ] Per-robot telemetry display (IMU, LiDAR, data plots)
- [ ] Robot control panel (E-Stop, velocity sliders, D-pad)
- [ ] Pilot view with camera feed and control overlay
- [ ] Map view with occupancy grid rendering
- [ ] Light and dark theme toggle with system preference detection
- [ ] Sidebar-driven navigation (Fleet → Robot → Detail)
- [ ] Responsive design (desktop primary, mobile functional)
- [ ] Defense-contractor visual aesthetic (OKLCH tokens, grid panels)

### Out of Scope

- AI/ML features (deferred — adds complexity without core value)
- User authentication (single-operator tool)
- Backend server (client-only, connects directly to rosbridge)
- Mobile-native app (web-responsive is sufficient)
- Real-time chat or collaboration features
- Database or persistent storage (localStorage only)

## Context

**This is the 4th attempt.** v1 collapsed from context provider sprawl and zero tests. v2 built features that never got wired into views. v3 passed 468 tests on a completely broken blank screen. The root cause across all failures was process, not code.

**V4 process ("Disciplined Autonomy"):**
- ALL GSD gates enabled (every transition requires human approval)
- 6-step mandatory UI tool chain for visual/integration phases
- Automated Playwright visual assertions (7 categories)
- Micro-phase scoping (one concern per phase, max 5 components)
- Phase classification: `logic` / `visual` / `integration`
- Metrics tracking for GSD benchmarking

**Process spec:** `docs/superpowers/specs/2026-03-22-v4-process-design.md`

**Architecture (carried from v3):**
- Data layer: roslib (transport) → RxJS (streams) → Zustand (UI state)
- Design: OKLCH color tokens, shadcn/ui + Radix heavily themed
- Two font weights only: 400 (body), 600 (headings)
- No barrel files (ADR-001), stores in domain folders (ADR-002)

**Known gotchas:**
- roslib is CommonJS — needs `optimizeDeps.include` in Vite config
- Dynamic rowHeight infinite loop (ISS-008) — use `window.innerHeight` for lg, static for md/sm
- `WidthProvider` from react-grid-layout breaks with resizable sidebar — use `useElementSize` hook
- Always gitignore BEFORE creating files with secrets

## Constraints

- **Tech stack**: React 19, TypeScript 5.9, Vite 7, RxJS 7, Zustand 5, roslib, shadcn/ui + Radix, Vitest 4, Playwright
- **Deployment**: GitHub Pages (static, client-only)
- **Design**: Defense-contractor aesthetic, light/dark theme toggle, OKLCH tokens
- **Process**: All GSD gates enabled, 6-step UI tool chain for visual phases, quality gate every phase
- **Code style**: One component per file, .types.ts, no barrel files, no @ts-ignore/eslint-disable

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| All GSD gates enabled | v3 failed because all gates were false — no enforcement | — Pending |
| Light + dark theme toggle | User wants both options, not dark-only | — Pending |
| Micro-phase scoping | v3 Phase 8 crammed 8+ concerns into one phase | — Pending |
| 6-step UI tool chain | Specialized tools (21st.dev, ui-ux-pro-max, frontend-design) prevent AI slop | — Pending |
| Automated visual assertions | 468 tests passed on broken app — need structural visual checks | — Pending |
| RxJS + Zustand + roslib | Replaces v1's 4 nested Context providers | ✓ Good (validated in v2/v3) |
| No barrel files (ADR-001) | Caused 68% module bloat in v2 | ✓ Good |
| Sidebar-driven IA | Replaces dual navbar + mode switcher from v2 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-23 after initialization*
