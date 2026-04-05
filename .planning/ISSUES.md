# Issues

Tracked improvements, refactors, and follow-ups. Not bugs — those go in git issues.

## Open

### ISS-004: Workspace grid responsive breakpoints

**Priority:** High
**Context:** At 768px viewport width, the 3-column grid is too cramped — panel headers truncate, Controls/IMU content overflows, telemetry axis labels crush together. Need responsive breakpoints: fewer columns at narrower widths (e.g., 2 cols at md, 1 col below that). Currently `overflow-hidden` prevents spillover but panels are unusable at tablet/narrow widths.
**Follow-up:** Discuss breakpoint strategy before implementing. Needs full visual pipeline.

### ISS-001: Add fallback prop to ConditionalRender

**Priority:** Low
**Context:** Currently ConditionalRender only renders when `shouldRender` is true, with no fallback. Many ternaries in the codebase use ConditionalRender for the truthy branch and a separate element for the falsy branch. A `fallback` prop would consolidate these into a single component.
**Follow-up:** After adding the prop, go through the repo and refactor existing ternaries that pair ConditionalRender with an else branch to use the fallback prop instead.

### ISS-002: Redesign StatusBar as context-aware status strip

**Priority:** Medium
**Context:** StatusBar is currently a static footer showing hardcoded "No robots connected / 0 topics." It adds no value. Should be redesigned as a view-aware status strip that shows relevant info per route:

- Fleet view: connected robot count, total topics, aggregate latency
- Workspace view: current robot connection status, topic subscription rate, latency
- Pilot view: control loop rate, camera FPS, connection quality
- Consider: is a persistent statusbar even the right pattern? Could this info live in view headers instead?
  **Follow-up:** Discuss design before implementing — needs `/frontend-design` + `ui-ux-pro-max` pipeline.

### ISS-003: Landing page — roadmap, docs, rosbridge instructions

**Priority:** Low
**Context:** Landing page needs additional content sections: a roadmap/what's next section, documentation links, and rosbridge setup instructions for new users. Currently the page has hero, features, problem/solution, CTA, and footer — but no onboarding guidance.
**Follow-up:** Needs full visual pipeline (discuss → ui-ux-pro-max → approve → /frontend-design → verify).

## Closed

(none)

---

# Code Quality Audit (2026-03-30)

40 issues found across TypeScript, React, accessibility, and project conventions.

## TypeScript (12)

- [ ] **`src/features/workspace/mocks/MockImu.tsx:25-31`** — `StableValue` props typed inline. Move to types/.
- [ ] **`src/features/workspace/mocks/MockImu.tsx:40-48`** — `ValueRow` props typed inline. Move to types/.
- [ ] **`src/features/workspace/mocks/MockImu.tsx:58`** — `AttitudeIndicator` props typed inline. Move to types/.
- [ ] **`src/features/workspace/mocks/MockImu.tsx:160`** — `CompassHeading` props typed inline. Move to types/.
- [ ] **`src/features/workspace/components/WorkspaceGrid.tsx:57`** — `WorkspaceGrid` uses inline prop type instead of `WorkspaceGridProps` interface.
- [ ] **`src/features/workspace/components/WorkspacePanel.tsx:11`** — `TopicSelector` props typed inline.
- [ ] **`src/features/fleet/mocks/FleetDevView.tsx:28`** — `SectionTitle` props typed inline.
- [ ] **`src/features/fleet/mocks/FleetDevView.tsx:42-46`** — `ImuVizSelect` props typed inline.
- [ ] **`src/features/workspace/components/ControlsPanel/DpadButton.tsx:31`** — `DPAD_BTN_ACTIVE as string` is a pointless cast. Remove.
- [ ] **`src/features/workspace/RobotWorkspace.tsx:107`** — `v as ImuVariant` cast. Use a type guard.
- [ ] **`src/stores/connection/useConnectionStore.ts:73-94`** — Multiple `as` casts on localStorage data. Use proper validation.
- [ ] **`src/features/workspace/types/WorkspaceGrid.types.ts:3-10`** — `PanelConfig` fields missing `readonly`.

## React (3)

- [ ] **`src/features/fleet/components/RobotCard/RobotCard.tsx:62-64`** — Inline arrow `() => onRemove(robot.id)` creates new ref each render. Use `useCallback`.
- [ ] **`src/features/workspace/components/WorkspaceGrid.tsx:28-31`** — Inline arrow in `.map()` for `onMinimize`. New callback per panel per render.
- [ ] **`src/features/workspace/components/WorkspaceGrid.tsx:100-103`** — Inline arrow in `.map()` for `restore`. Same issue.

## Semantic HTML / Accessibility (9)

- [ ] **`src/features/workspace/components/WorkspacePanel.tsx:39`** — Panel root is `<div>`. Use `<article>` with `aria-label`.
- [ ] **`src/features/workspace/components/WorkspacePanel.tsx:40`** — Panel header bar is `<div>`. Use `<header>`.
- [ ] **`src/features/workspace/components/WorkspacePanel.tsx:83`** — Panel footer is `<div>`. Use `<footer>`.
- [ ] **`src/features/workspace/components/WorkspaceGrid.tsx:44`** — `AllMinimizedMessage` uses `<span>` for block text. Use `<p>`.
- [ ] **`src/features/workspace/mocks/MockSystemStatus.tsx:21-83`** — Key-value data rows use bare `<div>`/`<span>`. Use `<dl>`/`<dt>`/`<dd>`.
- [ ] **`src/features/fleet/mocks/FleetDevView.tsx:104`** — Root wrapper is `<div>`. Use `<main>` or `<section>`.
- [ ] **`src/features/workspace/mocks/WorkspaceDevView.tsx:80`** — Root wrapper is `<div>`. Use `<section>`.
- [ ] **`src/features/fleet/components/RobotCard/components/RobotStatusBadge.tsx:16`** — Decorative icon missing `aria-hidden="true"`.
- [ ] **`src/features/workspace/components/WorkspacePanel.tsx:66-72`** — Fullscreen button has no `onClick`. Disable or remove until implemented.

## Project Conventions (16)

- [ ] **`src/features/workspace/mocks/MockImu.tsx`** — 3 exports + 4 sub-components in one file. Violates one-component-per-file.
- [ ] **`src/features/workspace/components/WorkspaceGrid.tsx:7`** — Type re-export `export type { PanelConfig }` creates a partial barrel. ADR-001 violation.
- [ ] **`src/App.tsx:11-13`** — JSDoc missing `ComponentName` on first line.
- [ ] **`src/features/workspace/RobotWorkspace.tsx:27`** — `DisconnectedOverlay` missing JSDoc.
- [ ] **`src/features/workspace/RobotWorkspace.tsx:35`** — `panelContent` missing JSDoc.
- [ ] **`src/features/workspace/mocks/MockImu.tsx:25`** — `StableValue` missing JSDoc.
- [ ] **`src/features/workspace/mocks/MockImu.tsx:40`** — `ValueRow` missing JSDoc.
- [ ] **`src/features/workspace/mocks/MockImu.tsx:58`** — `AttitudeIndicator` missing JSDoc.
- [ ] **`src/features/workspace/mocks/MockImu.tsx:160`** — `CompassHeading` missing JSDoc.
- [ ] **`src/features/fleet/mocks/FleetDevView.tsx:28`** — `SectionTitle` missing JSDoc.
- [ ] **`src/features/workspace/mocks/MockCamera.tsx:11`** — Hardcoded `oklch(0.16_0.02_260)` in className. Use design token.
- [ ] **`src/features/workspace/components/ControlsPanel/ControlsPanel.tsx:14`** — `../../` import. Use `@/` alias.
- [ ] **`src/features/workspace/components/ControlsPanel/VelocitySlider.tsx:2`** — `../../` import. Use `@/` alias.
- [ ] **`src/features/workspace/components/ControlsPanel/DpadButton.tsx:2-3`** — `../../` imports. Use `@/` alias.
- [ ] **`src/features/workspace/hooks/useControlStream/helpers.ts:2`** — `../../` import. Use `@/` alias.
- [ ] **`src/features/workspace/hooks/useControlStream/types.ts:2`** — `../../` import. Use `@/` alias.
