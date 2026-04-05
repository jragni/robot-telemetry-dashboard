# Phase 04: Folder Structure

**Status:** Complete
**Completed:** 2026-03-28
**Key commits:** `51d4d40`, `0df3896`, `279ae43`

## What was built

- Feature-domain folder organization (`src/features/`, `src/shared/`, `src/app/`)
- CLAUDE.md conventions for file naming and component structure
- FOLDER-STRUCTURE.md reference doc with scoping rules
- TESTING.md reference doc (co-location, unit/integration/E2E strategy)
- eslint-plugin-boundaries enforcing three-tier import rules (Shared -> Features -> App)

## Key decisions

- No barrel files (ADR-001) — direct imports only to avoid module bloat
- Stores live in domain folders (ADR-002), not a global `/stores` directory
- One component per `.tsx` file, types in `ComponentName.types.ts`
- Three-tier enforcement via ESLint: shared cannot import features, features cannot import app
