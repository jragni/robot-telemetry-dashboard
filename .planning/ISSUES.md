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

### ISS-004: Panel resize cursor feedback missing

- **Phase:** 14
- **Priority:** Medium
- **Type:** UX
- **Description:** When hovering over panel resize handles, the cursor doesn't change to indicate resizability. Users can't tell panels are resizable until they try. Need cursor: resize hints on drag/resize handles.
- **Discovered:** 2026-03-18 during Phase 14 checkpoint verification
- **Status:** Open — needs /frontend-design review

### ISS-005: Layout toolbar UX redesign needed

- **Phase:** 14
- **Priority:** Medium
- **Type:** UX/Design
- **Description:** The PanelToolbar (Edit Layout / Add Panel / Reset Layout) was wired in during Phase 14 but its placement and design needs a UX review. Should evaluate: where to position it, how it integrates with the defense-contractor aesthetic, and whether the interaction model is intuitive.
- **Discovered:** 2026-03-18 during Phase 14 checkpoint verification
- **Status:** Open — needs /frontend-design evaluation

## Closed

### ISS-001: CLOSED — Show component created, all conditionals replaced (Phase 13.1-02, commit da97d36)

### ISS-002: CLOSED — [].includes()/.some() pattern applied (Phase 13.1-02, commit 111e35e)

### ISS-003: CLOSED — Cross-feature imports promoted to shared layer (Phase 13.1-01, commits a75784a + 0ccc986)
