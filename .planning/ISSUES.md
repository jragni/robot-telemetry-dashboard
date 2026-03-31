# Issues

Tracked improvements, refactors, and follow-ups. Not bugs — those go in git issues.

## Open

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
