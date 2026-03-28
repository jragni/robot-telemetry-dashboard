# Robot Telemetry Dashboard — V4

## Process

GSD framework handles orchestration. All gates enabled. Checkpoint after every feature — user sees rendered output and approves before proceeding.

### Execution Rules

- **Build features as verticals, not horizontal slices.** Each feature built end-to-end (types → store → hook → component → tests → visual verification → checkpoint) before starting the next. Never build all stores, then all hooks, then all components.
- **Research tools FIRST.** Query context7, ui-ux-pro-max, /frontend-design BEFORE proposing any solution. Do not propose from own knowledge then validate — tools first, then recommendations. Apply the research findings when writing code.
- **Visual work executes inline** (`--interactive`). Never delegate visual components to parallel subagents — they cannot invoke `/frontend-design` or `ui-ux-pro-max`.
- **Discuss everything first.** Before code: what it looks like, how it works, edge cases.
- **Verify visually.** Must view rendered output (Playwright MCP or dev server) before claiming visual work is done. Code that compiles is not code that looks right.
- **/clear between major features.** Fresh context.

### UI Tool Chain (MANDATORY for visual/integration work)

1. **`ui-ux-pro-max`** — Query design intelligence DB for recommendations
2. **`/frontend-design`** — Production-grade implementation with anti-AI-slop filter
3. **`/gsd:ui-review`** — 6-pillar visual audit. Must score 7+ on AI Slop, Defense Aesthetic, Polish.
4. **Playwright MCP** — Screenshots at 1280x800 + 375x812

### Quality Gate

```bash
npm run lint && npx tsc --noEmit && npm run build
```

All must pass with ZERO errors and ZERO warnings. Add `npm test -- --run` and `npm run validate:tokens` once test infrastructure grows.

## Folder Structure

```
src/
├── components/           # Shared UI components
│   ├── widgets/          # Telemetry widget components
│   ├── {Component}.tsx   # One component per file
│   └── {Component}.types.ts
├── hooks/                # Custom React hooks
├── pages/                # Route-level page components
├── stores/               # Zustand stores
│   └── {domain}/         # Grouped by domain (connection/, telemetry/, etc.)
├── test-utils/           # Mock data generators, test helpers
├── types/                # Shared type definitions (ROS messages, etc.)
├── utils/                # Pure utility functions
├── index.css             # Design system tokens (@theme + :root)
├── main.tsx              # React entry point
└── App.tsx               # Router + top-level layout
```

## Code Conventions

### File Rules

- One component per `.tsx` file
- Types in `{ComponentName}.types.ts` (same directory)
- No barrel files (ADR-001) — import directly from source
- Stores in domain folders (ADR-002)
- Named exports only
- No `@ts-ignore`, `eslint-disable`, `as any`

### Styling Rules

- **All colors via Tailwind utilities** — `bg-surface-primary`, `text-accent`, `border-border`. For values not in @theme, use `var(--color-*)` from index.css.
- **Never hardcode** hex, rgb, or oklch values in components
- **All fonts** via `font-sans` (Exo) or `font-mono` (Roboto Mono) utilities
- **Font sizes strictly 12/14/20/36px** — no exceptions. Map: `text-xs`=12, `text-sm`=14, `text-xl`=20, `text-4xl`=36 (configure in @theme if needed)
- **Two font weights only:** 400 (`font-normal`) and 600 (`font-semibold`)
- **Surface glow** on every panel: `shadow-[inset_0_1px_0_0_var(--color-surface-glow)]`
- **Border radius** max 2px (`rounded-sm`) — no large radii
- **Interactive elements:** `cursor-pointer`, `transition-all duration-200`, `focus-visible:outline-2 focus-visible:outline-accent`
- **prefers-reduced-motion** respected — use `motion-safe:` prefix for animations

### Component Pattern

```tsx
// src/components/ExampleCard.tsx
import type { ExampleCardProps } from './ExampleCard.types';

export function ExampleCard({ title, value }: ExampleCardProps) {
  return (
    <div className="bg-surface-primary border border-border rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)] p-4">
      <h3 className="font-sans text-sm font-semibold text-text-primary">
        {title}
      </h3>
      <span className="font-mono text-xs text-accent">{value}</span>
    </div>
  );
}
```

### Status Indicators

- **Triple-redundant always:** color + icon + text label (MIL-STD-1472H)
- **Terminology:** Nominal / Caution / Critical / Offline (never Active / Warning / Error / Disconnected)
- **Never color-only** — accessible to colorblind users

## Visual Rules — Midnight Operations

- **Dark mode default.** Standalone pages (landing) must force dark theme.
- **Muted professional light mode.** Cool grays (oklch 0.95-0.84), not stark white.
- **Surface glow** on all panels — subtle inset box-shadow in accent color at 0.04 opacity
- **Registration tick marks** on panel corners — accent-colored border fragments for precision feel
- **Data value glow** — telemetry numbers get subtle text-shadow in accent color (dark mode only)
- **Breathing animation** on nominal status dots — conveys "system alive"
- **Empty states must be designed** — helpful message + icon + action button, not blank screens
- **Mock/demo data when no rosbridge** — widgets render mock telemetry so app looks alive

## Connection Behavior

- **Do NOT auto-connect on startup.** Show fleet empty state with "Add Robot" CTA.
- **Sidebar robot list reads from connection store** — not hardcoded.

## Architecture

- **Data layer:** roslib 2.x (pure ESM) → RxJS (streams) → Zustand (UI state)
- **Design:** Midnight Operations aesthetic (deep blue-shifted charcoal + blue accent, hue 260)
- **Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, shadcn/ui + Radix, Vitest, Playwright
- **Fonts:** Exo (UI sans-serif) + Roboto Mono (telemetry data)

## Commit Style

- No Co-Authored-By lines
- No AI mention
- Focus on changes + impact only

## Gotchas

- roslib 2.x is pure ESM — use named imports: `import { Ros, Topic } from 'roslib'`
- No barrel files — caused 68% module bloat in v2
- Dynamic rowHeight infinite loop (ISS-008) — use `window.innerHeight` for lg, static for md/sm
- Canvas 2D cannot resolve CSS vars directly — use `getComputedStyle()` fallback pattern
- Always gitignore BEFORE creating files with secrets
- Token namespace: only `--color-surface-*`, `--color-text-*`, `--color-accent*`, `--color-status-*`, `--color-border*` exist — never invent new namespaces
