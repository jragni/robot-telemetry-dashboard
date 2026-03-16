# Phase 13: Component Conventions - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning (re-plan from scratch)

<vision>
## How This Should Work

A full convention pass across every .tsx component file in the codebase. When you open any feature folder after this, the structure is immediately predictable — you know exactly where the main component lives, where its types are, and where sub-components are. No scrolling through 200-line files to find where one component ends and another begins.

Every component file should feel focused and small. If you're scrolling, something should have been extracted. The codebase should feel like it was built by someone who cares about organization, not dumped out overnight by an autonomous build.

Files that already follow conventions get left alone — we only touch what violates the rules. But every violation gets fixed, no exceptions.

</vision>

<essential>
## What Must Be Nailed

- **Predictable structure** — Every component folder looks the same. Open any feature and you instantly know where types, sub-components, and the main component live.
- **Small, focused files** — No file over ~100-150 lines of TSX. One component per .tsx file, always.
- **All types extracted** — Even single-field interfaces go to .types.ts. Maximum consistency, no judgment calls about "is this too small to extract." Zero inline interfaces in .tsx files.
- **Selective barrel exports** — Main component always exported from index.ts. Sub-components only exported if they're actually used outside their parent feature.

</essential>

<boundaries>
## What's Out of Scope

- No behavior changes — pure structural refactoring only. No fixing bugs, no changing logic, no adding features.
- No test rewrites — fix import paths if they break, but don't rewrite test structure or add new tests.
- Don't touch files that already follow conventions — only fix violations.
- Don't touch hook files, utility files, store files, or service files — this is about .tsx component files only.

</boundaries>

<specifics>
## Specific Ideas

- Follow the flat-siblings convention from earlier feedback: sub-components as sibling files next to the parent. Only create subfolders if a sub-component gets its own sub-components.
- The type extraction rule is strict: ALL interfaces/types/enums go to .types.ts, regardless of size. No "trivially small" exception.
- The existing 13-01-PLAN.md should be thrown out and re-planned from scratch to cover the full convention pass, not just 4 files.
- Barrel exports are selective — check if a sub-component is imported outside its parent before deciding whether to export it from index.ts.

</specifics>

<notes>
## Additional Context

The user's original convention feedback (saved in memory) described this pattern but the overnight autonomous build didn't follow it. This phase is about enforcing what was always intended.

The explore agent found 5 files with multi-component violations and ~7 more with inline-types-only violations. The full pass needs to cover all of them, plus any others that were missed.

Key files already identified as violations:

- PilotHud.tsx (6 components in one file — worst offender)
- ConnectionsSidebar.tsx (3 components)
- Header.tsx (3 components)
- DataPlotWidget.tsx (2 components)
- ControlPad.tsx (inline interface)
- Plus ~7 more files with inline interfaces only

</notes>

---

_Phase: 13-component-conventions_
_Context gathered: 2026-03-16_
