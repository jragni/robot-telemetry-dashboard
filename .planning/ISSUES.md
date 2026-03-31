# Issues

Tracked improvements, refactors, and follow-ups. Not bugs — those go in git issues.

## Open

### ISS-001: Add fallback prop to ConditionalRender

**Priority:** Low
**Context:** Currently ConditionalRender only renders when `shouldRender` is true, with no fallback. Many ternaries in the codebase use ConditionalRender for the truthy branch and a separate element for the falsy branch. A `fallback` prop would consolidate these into a single component.
**Follow-up:** After adding the prop, go through the repo and refactor existing ternaries that pair ConditionalRender with an else branch to use the fallback prop instead.

## Closed

(none)
