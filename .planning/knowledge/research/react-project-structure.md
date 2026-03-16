---
title: React Project Structure & File Organization Best Practices
date: 2026-03-16
relevance: high
tags:
  [
    react,
    typescript,
    project-structure,
    barrel-files,
    zustand,
    co-location,
    feature-folders,
  ]
sources:
  - type: video
    url: https://www.youtube.com/watch?v=xyxrB2Aa7KE
    title: React project structure (feature-based with ESLint boundaries)
  - type: web
    url: https://www.totaltypescript.com/where-to-put-your-types-in-application-code
    author: Matt Pocock
    title: Where To Put Your Types in Application Code
  - type: web
    url: https://tkdodo.eu/blog/please-stop-using-barrel-files
    author: TkDodo (Dominik Dorfmeister)
    title: Please Stop Using Barrel Files
  - type: web
    url: https://tkdodo.eu/blog/working-with-zustand
    author: TkDodo
    title: Working with Zustand
  - type: web
    url: https://kentcdodds.com/blog/colocation
    author: Kent C. Dodds
    title: Colocation
  - type: web
    url: https://github.com/alan2207/bulletproof-react
    title: Bulletproof-React reference architecture
  - type: web
    url: https://github.com/pmndrs/zustand/discussions/2496
    title: Zustand GitHub Discussions — multiple stores
  - type: web
    url: https://www.robinwieruch.de/react-folder-structure/
    author: Robin Wieruch
    title: React Folder Structure in 5 Steps
---

# React Project Structure & File Organization (2025-2026 Consensus)

## Key Findings

### 1. Co-location is the governing principle

Types, constants, and stores should live at the smallest scope required. Promote to shared locations only when a second consumer demands it. A global `/types` folder as a dumping ground is an anti-pattern.
**Sources:** Matt Pocock, Kent C. Dodds, Bulletproof-React

### 2. STOP using barrel files (index.ts) in application code

Barrel `index.ts` files create circular import risks, force synchronous loading of all sibling modules. TkDodo measured **68% module reduction** (11k → 3.5k loaded modules) after removing barrels from a production Next.js app. Only legitimate use: entry-point of a published library.
**Sources:** TkDodo (with hard data), Bulletproof-React (reversed their barrel recommendation)

### 3. Feature-based organization is the industry consensus

Organize by business domain (`features/products/`, `features/users/`), not by technical type (`components/`, `hooks/`, `services/`). Each feature is self-contained. Grafana, Bulletproof-React, and enterprise case studies converge on this.
**Sources:** Video, Bulletproof-React, Grafana, Robin Wieruch, Adjoe Engineering

### 4. One-way data flow: shared → features → app

Features import from shared code but NEVER from other features. Enforce with `eslint-plugin-boundaries`.
**Sources:** Video (~10:00-11:00), Bulletproof-React

### 5. Zustand: multiple small domain stores, export hooks only

One store per domain. Export custom `useXxxStore` hooks, not raw store creators. Slices pattern only for genuinely coupled cross-domain state.
**Sources:** TkDodo, Zustand GitHub Discussions (maintainer guidance)

### 6. Constants follow same scoping as types

Co-located `.constants.ts` for feature-specific values. `src/config/` for environment-driven app-wide config.
**Sources:** Semaphore CI, consistent with Kent C. Dodds colocation principle

## Decisions This Research Informed

- Remove ALL barrel files (index.ts) from application code
- Stores in domain folders with named files (not index.ts)
- Types co-located at smallest scope
- Constants co-located per component/feature
