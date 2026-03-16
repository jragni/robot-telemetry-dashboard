# Phase 13: Component Conventions - Context (Expanded)

**Gathered:** 2026-03-16
**Updated:** 2026-03-16 (expanded from component-only to full repo-wide convention pass)
**Status:** Plans 01-03 complete (component extraction). Plans 04+ needed for stores, services, hooks, constants, barrel removal, knowledge base setup.

<vision>
## How This Should Work

A full repo-wide convention pass — not just .tsx components, but stores, services, hooks, constants, barrel exports, and project knowledge infrastructure. When you open any folder in this codebase, the structure is immediately predictable. Every file type has a clear home. Every import is direct (no barrel indirection). Research and decisions are documented and searchable.

The codebase should feel like it was designed by someone who read the research, made deliberate choices, and enforced them consistently. Not like an overnight autonomous build.

### What's Already Done (Plans 01-03)

- All .tsx component files: one component per file
- All component interfaces extracted to .types.ts files
- 47 files created/modified across 8 tasks

### What Remains (Plans 04+)

- Stores: Move into domain folders with named files + types
- Services: Move into nested domain folders with types
- Hooks: Extract hook types to .types.ts files
- Constants: Extract inline constants to .constants.ts files
- Barrel removal: Delete ALL index.ts barrel files, update all imports to direct paths
- Knowledge base: Set up .planning/knowledge/ with research, specs, decisions
- Barrel audit: Update every import across the codebase

</vision>

<essential>
## What Must Be Nailed

- **Remove ALL barrel files** — Delete every index.ts in features/, stores/, services/, components/. Direct imports everywhere. (ADR-001)
- **Stores in domain folders** — Each store gets a folder: connections/, ros/, etc. with connections.store.ts + connections.types.ts + connections.test.ts. No index.ts. (ADR-002)
- **Services in nested domain folders** — Same pattern: transport/, subscriber/, etc. inside services/ros/
- **ALL hook types extracted** — useXxx.types.ts next to every hook
- **Constants co-located** — Component-specific constants in {name}.constants.ts, app-wide in src/config/
- **Knowledge base operational** — .planning/knowledge/ with research/, specs/, decisions/ populated
- **Every import updated** — No broken imports, no barrel references remaining

</essential>

<boundaries>
## What's Out of Scope

- No behavior changes — pure structural refactoring
- No test rewrites — fix import paths only
- Don't touch shadcn/ui files (src/components/ui/\*) — generated code
- Don't restructure src/types/ (shared cross-feature types stay flat per research)
- Don't restructure src/config/ (already well-organized per research)
- Don't add eslint-plugin-boundaries yet — that's a future phase

</boundaries>

<specifics>
## Specific Decisions Made

### Barrel Files (ADR-001)

- Remove ALL index.ts barrel files from application code
- Use direct imports: `@/features/panels/components/PanelGrid` not `@/features/panels`
- Research: TkDodo measured 68% module reduction after removing barrels
- See: .planning/knowledge/decisions/001-remove-barrel-files.md

### Store Structure (ADR-002)

- Domain folders with named files, no barrel
- `src/stores/connections/connections.store.ts` + `connections.types.ts` + `connections.test.ts`
- Import: `from '@/stores/connections/connections.store'`
- See: .planning/knowledge/decisions/002-store-domain-folders.md

### Service Structure

- Same pattern as stores: nested domain folders
- `src/services/ros/transport/RosTransport.ts` + `RosTransport.types.ts` + `RosTransport.test.ts`

### Hook Types

- ALL hook interfaces extracted to `useXxx.types.ts` next to the hook

### Constants

- Component-specific: `{ComponentName}.constants.ts` co-located
- App-wide: stays in `src/config/`

### Knowledge Base

- `.planning/knowledge/research/` — Auto-save all research with relevance tags
- `.planning/knowledge/decisions/` — ADR format for architectural decisions
- `.planning/knowledge/specs/` — Living specs per feature
- Agents: Explicit @references in plans + automatic search of .planning/knowledge/

</specifics>

<notes>
## Research Foundation

All structural decisions informed by research documented at:

- `.planning/knowledge/research/react-project-structure.md` (11 web + 1 video source)

Key authorities consulted:

- Matt Pocock (Total TypeScript) — type co-location
- TkDodo (TanStack) — anti-barrel, Zustand patterns
- Kent C. Dodds — colocation principle
- Bulletproof-React — feature folder architecture
- Grafana — large-scale React codebase patterns

</notes>

---

_Phase: 13-component-conventions_
_Context expanded: 2026-03-16_
