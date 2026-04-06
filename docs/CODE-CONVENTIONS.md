# Code Conventions

Source of truth for all code rules.

## File Structure

- One component per `.tsx` file
- Types co-located with their component as `{ComponentName}.types.ts` in the same folder. Never inline in `.tsx` files. Feature-shared types (used by 2+ components within a feature) go in `feature/types/`. Cross-feature types go in `src/types/`.
- No feature-level barrel files (ADR-001 revised) — component-folder and hooks directory barrels are allowed (see FOLDER-STRUCTURE.md)
- Named exports only
- No `@ts-ignore`, `eslint-disable`, `as any`
- Feature folders: `components/` for UI, `hooks/` for hooks, `constants.ts` (not `{feature}.constants.ts`), `helpers.ts` (not `{feature}.helpers.ts`). Page-level components live at the feature root. Mocks in `mocks/`. Feature `types/` folder only for types shared across multiple components within the feature.
- Hook folders: every shared hook in `src/hooks/` gets its own folder: `hooks/{hookName}/` with `{hookName}.ts`, `index.ts`, and co-located tests, types, constants, helpers as needed. No flat hook files in `src/hooks/`. No `__tests__/` subfolder — tests co-locate directly in the hook's folder.
- Shared component folders: components in `src/components/` with 2+ files get their own folder. Single-file components stay flat.
- Test file placement: co-locate test files next to source by default (`RobotCard.test.tsx` beside `RobotCard.tsx`). When a folder accumulates 3+ test files, move them to a `__tests__/` subfolder within that folder. The `__tests__/` folder lives inside the directory it tests — never at a higher level. Already in use: `src/hooks/__tests__/`, `src/stores/connection/__tests__/`, `src/lib/rosbridge/__tests__/`.

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
- Mobile-only components must be clearly identified. File name should include `Mobile` (e.g., `RobotWorkspaceMobile.tsx`, `PilotHudMobile.tsx`). JSDoc `@description` must state it is mobile-only and name its parent consumer.

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

## ROS 2 Integration

All code interacting with ROS must follow the official ROS 2 interface definitions (`ros2 interface show <type>`). Zod schemas, TypeScript types, and field names must match the actual message spec. Account for rosbridge JSON serialization — JSON has no `NaN`/`Infinity`, so rosbridge sends `null` for those values. Always use `.nullable()` on numeric array fields that could contain invalid readings (e.g., `ranges`, `intensities` in `sensor_msgs/msg/LaserScan`). When in doubt, run `ros2 topic echo <topic>` against a real robot and validate the schema against actual data.

## Status Indicators

Triple-redundant: color + icon + text label (per MIL-STD-1472H). Terminology: Nominal / Caution / Critical / Offline.

## Docstrings

JSDoc is required on all exported functions in `.tsx` and `.ts` files — components, hooks, helpers, store actions, utilities. Skip JSDoc only when the function is short, self-descriptive, and has no non-obvious parameters (e.g., `formatDegrees(deg: number): string` needs no comment).

### Hooks and utility functions — use `@param`

Hooks and utilities take actual function parameters. Document them with `@param`:

```ts
/** useZoom
 * @description Manages zoom state with clamped min/max and keyboard support.
 * @param config - Zoom configuration with min, max, step, and optional initial value.
 * @returns Zoom state and handler functions.
 */
export function useZoom(config: ZoomConfig) {
```

### React components — use `@prop`, not `@param`

Components receive a props object, not individual parameters. Use `@prop` to document props:

```ts
/** PilotCompass
 * @description Renders a horizontal compass heading strip using Canvas 2D.
 *  Tick marks slide horizontally based on IMU yaw angle.
 * @prop heading - Current heading in degrees (0-360).
 */
export function PilotCompass({ heading }: PilotCompassProps) {
```

Keep `.types.ts` files clean — just the interface with types, no inline JSDoc comments. The component's JSDoc is the single source of truth for what each prop means.

### General rules

- First line: function/component name
- `@description`: required. Explain purpose and behavior, not just "renders X" or "returns Y"
- `@param`: only on hooks, utilities, and non-component functions. Never on React component props.
- `@returns`: required when the return value is non-obvious (skip for void, skip for components returning JSX)
- Lines wrap at 100 characters

### When to skip JSDoc entirely

- Function is under ~5 lines and the name fully describes its behavior
- Pure one-liner utilities with obvious signatures (e.g., `clamp`, `capitalize`)
- Private/unexported helper functions that are only called once nearby

## PR Conventions

- Titles: `T-XXX: description`
- Comments: plain text only. No markdown formatting, no bold headers, no styled bullets. State what was done.
- No Co-Authored-By lines in commits
- No AI mention in commits or PR comments
- Every PR must include tests for the changes. No code-only PRs — if you change behavior, add or update tests covering that behavior. Test-only PRs (backfilling coverage) are fine standalone.
