# Issues & Enhancements

## Open

### ISS-001: Add ConditionalRender component to replace inline conditional rendering

- **Phase:** 13 (Component Conventions)
- **Priority:** Medium
- **Type:** Enhancement
- **Description:** Create a `<ConditionalRender>` component (or `<Show>`/`<When>` pattern) that replaces ternary and `&&` conditional rendering throughout the codebase. Centralizes conditional logic, improves readability, and prevents common pitfalls (e.g., `0 && <Component>` rendering "0").
- **Scope:** Repo-wide — audit all `.tsx` files for conditional rendering patterns and replace with the new component.
- **Discovered:** 2026-03-16 during Phase 13 convention pass
- **Status:** Open — add as a future phase or extend Phase 13

### ISS-002: Replace 3+ OR comparisons with [].includes() pattern

- **Phase:** 13 (Component Conventions)
- **Priority:** Low
- **Type:** Code style
- **Description:** Audit codebase for `x === 'a' || x === 'b' || x === 'c'` patterns (3+ OR gates) and replace with `['a', 'b', 'c'].includes(x)`. Known instance: `src/features/connections/hooks/useDisconnectHandler.ts:39`.
- **Discovered:** 2026-03-16
- **Status:** Open

### ISS-003: Cross-feature imports violate one-way data flow

- **Phase:** 13.1
- **Priority:** High
- **Type:** Architecture
- **Description:** Features import from other features, violating the `shared → features → app` one-way data flow. Shared code (`useRosConnection`, `NoConnectionOverlay`, `VideoFeed`, `ControlPad`, `PanelComponentProps`) must be promoted to the shared layer (`src/components/shared/`, `src/hooks/`, `src/types/`).
- **Discovered:** 2026-03-16 during audit against video research
- **Status:** Open — folded into Phase 13.1

### ISS-007: Video stream not working on live robot

- **Phase:** TBD (new phase needed)
- **Priority:** High
- **Type:** Bug
- **Description:** On a live robot, the video feed does not work despite LiDAR and controls functioning correctly. The WebRTC video stream fails to connect or render. LiDAR (ROS topic subscription) and controls (ROS publishing) work, so the rosbridge connection is healthy — the issue is isolated to the WebRTC/video pipeline.
- **Discovered:** 2026-03-18 during live robot testing
- **Status:** Open — needs dedicated debugging phase

## Closed

### ISS-001: CLOSED — Show component created, all conditionals replaced (Phase 13.1-02, commit da97d36)

### ISS-002: CLOSED — [].includes()/.some() pattern applied (Phase 13.1-02, commit 111e35e)

### ISS-003: CLOSED — Cross-feature imports promoted to shared layer (Phase 13.1-01, commits a75784a + 0ccc986)

### ISS-004: CLOSED — Panel resize cursor feedback addressed (Phase 14-04)

### ISS-005: CLOSED — Layout toolbar UX redesigned (Phase 14-04)

### ISS-006: CLOSED — Sidebar toggle moved below Header into DashboardShell (Phase 14-04)
