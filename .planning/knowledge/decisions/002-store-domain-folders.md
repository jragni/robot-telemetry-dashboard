---
id: ADR-002
title: Organize Zustand stores in domain folders with named files
status: accepted
date: 2026-03-16
decision-makers: [user, claude]
tags: [zustand, stores, file-structure]
---

# ADR-002: Organize Zustand Stores in Domain Folders

## Status

Accepted

## Context

Stores are currently flat files in `src/stores/` (e.g., `connections.store.ts`, `ros.store.ts`). Each store has related files (tests, and now types after Phase 13 type extraction). Grouping into domain folders improves organization.

## Decision

Move each store into a domain folder with named files (no barrel):

```
src/stores/connections/
  connections.store.ts
  connections.types.ts
  connections.test.ts
```

Import via direct path: `import { useConnectionsStore } from '@/stores/connections/connections.store'`

## Consequences

**Positive:**

- Store + types + tests grouped together
- Consistent with feature-folder pattern
- Scales cleanly as stores grow

**Negative:**

- Longer import paths
- Every store import across codebase needs updating

## Alternatives Considered

1. **index.ts as main store** — rejected per ADR-001 (no barrel files)
2. **Flat files with .store.types.ts siblings** — rejected; 3+ files per store warrants a folder
3. **Drop .store suffix inside folder** — rejected; explicit naming prevents ambiguity

## Research

See: `.planning/knowledge/research/react-project-structure.md`
