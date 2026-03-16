---
id: ADR-001
title: Remove all barrel files (index.ts) from application code
status: accepted
date: 2026-03-16
decision-makers: [user, claude]
tags: [barrel-files, imports, performance, architecture]
---

# ADR-001: Remove All Barrel Files From Application Code

## Status

Accepted

## Context

The codebase has barrel `index.ts` files in every feature folder that re-export components, hooks, and types. During Phase 13 planning, research revealed strong industry consensus against barrel files in application code.

Key evidence:

- TkDodo measured **68% module reduction** (11k → 3.5k) after removing barrels from a production Next.js app
- Bulletproof-React (28k+ GitHub stars) reversed their barrel recommendation
- Barrel files create circular import risks and force synchronous loading of all sibling modules
- The only legitimate use case is the entry-point of a published library

## Decision

Remove ALL `index.ts` barrel files from `src/features/`, `src/stores/`, `src/services/`, and `src/components/`. Use direct imports to source files everywhere.

## Consequences

**Positive:**

- Reduced module loading (potentially significant for dev server startup and HMR)
- Eliminated circular import risk
- Imports explicitly show where code lives (better code navigation)
- Follows 2025 industry consensus (TkDodo, Bulletproof-React, Matt Pocock)

**Negative:**

- Longer import paths (`@/features/panels/components/PanelGrid` vs `@/features/panels`)
- ~100+ import statements need updating across codebase
- Less abstraction of internal feature structure

**Mitigations:**

- TypeScript path aliases (`@/`) keep paths manageable
- One-time migration cost, automated via find-and-replace

## Alternatives Considered

1. **Keep barrels** — rejected because performance data is compelling and industry has moved on
2. **Keep feature barrels, skip store barrels** — rejected for consistency; if barrels are bad, they're bad everywhere
3. **Phased removal** — rejected; clean break is simpler than gradual migration

## Research

See: `.planning/knowledge/research/react-project-structure.md`
