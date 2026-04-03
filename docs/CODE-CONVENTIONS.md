# Code Conventions

Source of truth for all code rules. Referenced by CLAUDE.md.

## File Structure

- One component per `.tsx` file
- Types in feature `types/` folder as `{ComponentName}.types.ts` (named after the primary consumer). Never inline in `.tsx` files, never co-located next to components. Shared types (cross-feature) go in `src/types/`.
- No barrel files (ADR-001) — import directly from source
- Named exports only
- No `@ts-ignore`, `eslint-disable`, `as any`
- Feature folders: `components/` for UI, `hooks/` for hooks, `constants.ts` (not `{feature}.constants.ts`), `helpers.ts` (not `{feature}.helpers.ts`), `types/` for interfaces. Page-level components live at the feature root. Mocks in `mocks/`.
- Hook folders: when a hook grows beyond a single file, give it its own folder: `hooks/{hookName}/` with `{hookName}.ts`, `types.ts`, `constants.ts`, `helpers.ts`.
- Shared component folders: components in `src/components/` with 2+ files get their own folder. Single-file components stay flat.

## Imports

**Aliases:** Use `@/` for any import outside the current feature directory. Relative imports (`./`, `../`) only for siblings within the same feature folder. Never use `../../` or deeper.

**Ordering:** Three groups separated by blank lines. Within each group: hooks, then 3rd party components, then `@/` components, then types. Alphabetize by import name within each sub-group. React is always the first import.

```ts
// 3rd party — React first, then hooks, libraries, types
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import type { Ros } from 'roslib';

// Aliased — hooks → 3rd party components → @/ components → types
import { useBatterySubscription } from '@/hooks/useBatterySubscription';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { Activity, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PanelId } from '@/features/workspace/types/panel.types';

// Relative — hooks → components → types
import { useMinimizedPanels } from './hooks/useMinimizedPanels';
import { SystemStatusPanel } from './components/SystemStatusPanel';
import type { WorkspaceProps } from './types/Workspace.types';
```

## Naming

- Object key ordering: all object literals — keys in alphabetical order
- Destructured props: alphabetized

## Comments

- No styled section separators (`// ── Section ──────`). Plain `// comment` only when logic isn't self-evident.
- No AI-pattern comments (overzealous JSDoc on trivial constants, decorative line separators, uniform comment ceremony).
- JSDoc required only on `.tsx` exports. Self-describing functions and constants need no comment.

## Components

- Extract inline JSX blocks over ~5 lines into named components. If a conditional branch contains a multi-line JSX subtree, it should be its own component.
- Assign complex boolean conditions to named variables before using in JSX (e.g., `const canMinimize = !!onMinimize && !maximized`).
- Conditional rendering: `&&` or ternaries. No wrapper components.
- shadcn-first: always check if shadcn can handle it before building custom.

## State Management

- No React Context. Use Zustand with selectors for all shared state. No `createContext`/`useContext`.

## Semantic HTML

- Use proper semantic elements (`<section>`, `<nav>`, `<article>`, `<aside>`, `<header>`, `<footer>`, `<main>`, `<figure>`) instead of generic `<div>`.
- Interactive elements must be `<button>` or `<a>`, never `<div onClick>`.
- Navigation links use `<Link>` or `<a>`, not `<button>`.
- All interactive elements need `aria-label` when the visible text doesn't describe the action.

## Typography

- Every text element must have an explicit font family (`font-sans` or `font-mono`).
- Labels = `font-sans`, telemetry data = `font-mono`.
- Only 12/14/20/36px sizes (text-xs/text-sm/text-xl/text-4xl).
- Only weights 400/600.
- Canvas text must use design system font sizes.

## Status Indicators

Triple-redundant: color + icon + text label (per MIL-STD-1472H). Terminology: Nominal / Caution / Critical / Offline.

## Docstrings

All exported `.tsx` components and functions must have JSDoc docstrings following [Google JS Style Guide](https://google.github.io/styleguide/jsguide.html). Format:

```ts
/** MyComponent
 * @description Renders the widget with configuration options.
 * @param label - The display label for the widget.
 */
```

`@param` and `@returns` required where applicable. Lines wrap at 100 characters.

## PR Conventions

- Titles: `T-XXX: description`
- Comments: plain text only. No markdown formatting, no bold headers, no styled bullets. State what was done.
- No Co-Authored-By lines in commits
- No AI mention in commits or PR comments
