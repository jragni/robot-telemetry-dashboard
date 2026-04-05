# Phase 09: Convention Enforcement + Component Refactors

**Status:** Complete
**Completed:** 2026-03-30
**Key commits:** `04e1c39`, `1f831cd`

## What was built

- ConditionalRender component (replaces {condition && <X />} across 8 files)
- RobotCard refactored to shadcn Card + 6 subcomponents (Identity, Connection, Vitals, Graph, Actions, DataRow)
- All inline types moved to feature types/ folders (9 fleet type files)
- AppShell: backdrop a11y fix (aria-hidden), inline style to CSS, JSX comments removed
- Header/Sidebar types moved to src/types/
- NotFound + ComingSoon extracted from App.tsx to src/components/
- Pilot route, sidebar nav item, header breadcrumb added
- 40 files updated to Google JS Style Guide JSDoc format
- Design process hook (command-based reminder on .tsx edits)
- DESIGN-SYSTEM.md semantic typography mapping (shadcn-aligned)
- CLAUDE.md updated with ConditionalRender rule, docstring rules, design process enforcement

## Key decisions

- ConditionalRender accepts Component (type or JSX element) + shouldRender — no fallback prop
- Design process hook is a reminder, not a blocker (previous prompt-based hook was too aggressive)
- AppShell JSX comments removed rather than extracting subcomponents (layout orchestrator exception)
- Backdrop uses aria-hidden + document keydown listener instead of role="button"
- Shared component types live in src/types/, feature types in feature/types/
- "Signal Not Found" rejected for 404 page — keep it direct and real, no themeing error messages
