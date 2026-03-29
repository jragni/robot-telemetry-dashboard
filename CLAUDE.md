# Robot Telemetry Dashboard — V4

## Process

GSD for state tracking (STATE.md, ROADMAP.md). Freeform pair programming for execution. Checkpoint after every feature — user sees rendered output and approves before proceeding.

### Execution Rules

- **Build features as verticals, not horizontal slices.** Each feature built end-to-end (types → store → hook → component → tests → visual verification → checkpoint) before starting the next. Never build all stores, then all hooks, then all components.
- **Research tools FIRST.** Query context7, ui-ux-pro-max, /frontend-design BEFORE proposing any solution. Do not propose from own knowledge then validate — tools first, then recommendations. Apply the research findings when writing code.
- **Visual work executes inline.** Never delegate visual components to parallel subagents — they cannot invoke `/frontend-design` or `ui-ux-pro-max`.
- **Discuss everything first.** Before code: what it looks like, how it works, edge cases.
- **Verify visually.** Must view rendered output (Playwright MCP or dev server) before claiming visual work is done. Code that compiles is not code that looks right.
- **/clear between major features.** Fresh context.

### UI Tool Chain (MANDATORY for visual work)

1. **`ui-ux-pro-max`** — Query design intelligence DB for recommendations
2. **`/frontend-design`** — Production-grade implementation with anti-AI-slop filter
3. **`/gsd:ui-review`** — 6-pillar visual audit. Must score 7+ on AI Slop, Defense Aesthetic, Polish.
4. **Playwright MCP** — Screenshots at 1280x800 + 375x812

### Pre-Write Checklist

Before writing ANY component file, verify:

- [ ] Can shadcn handle this? Check shadcn components first
- [ ] No constants/config objects inline — extract to `.constants.ts`
- [ ] No JSX comments describing children — extract to named subcomponents
- [ ] 3+ subcomponents → own folder
- [ ] Types in `.types.ts`, not inline
- [ ] All colors via Tailwind utilities, not var() or hardcoded
- [ ] Font sizes strictly 12/14/20/36px
- [ ] Canonical Tailwind classes, not arbitrary `[value]` — use `p-3` not `p-[12px]`
- [ ] Interactive elements have cursor-pointer, transition, focus-visible

## Reference Docs

| Topic            | Document                                             | What it covers                                                                                         |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Styling & Tokens | [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md)       | Colors, typography, spacing, panel contract, animations, buttons, empty states, responsive breakpoints |
| Folder Structure | [docs/FOLDER-STRUCTURE.md](docs/FOLDER-STRUCTURE.md) | Feature domains, file naming, scoping rules, shadcn-first, constants/helpers conventions               |
| Testing          | [docs/TESTING.md](docs/TESTING.md)                   | Co-location, unit tests, integration tests, E2E, quality gate                                          |

These docs are the source of truth. CLAUDE.md does not duplicate their content.

## Code Conventions

- One component per `.tsx` file
- Types in `{ComponentName}.types.ts` (same directory)
- No barrel files (ADR-001) — import directly from source
- Named exports only
- No `@ts-ignore`, `eslint-disable`, `as any`
- **Status indicators:** Triple-redundant (color + icon + text label per MIL-STD-1472H). Terminology: Nominal / Caution / Critical / Offline.

## Connection Behavior

- **Do NOT auto-connect on startup.** Show fleet empty state with "Add Robot" CTA.
- **Sidebar robot list reads from connection store** — not hardcoded.

## Architecture

- **Data layer:** roslib 2.x (pure ESM) → RxJS (streams) → Zustand (UI state)
- **Design:** Midnight Operations aesthetic (deep blue-shifted charcoal + blue accent, hue 260)
- **Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, shadcn/ui + Radix, Vitest, Playwright
- **Fonts:** Exo (UI sans-serif) + Roboto Mono (telemetry data)
- **Icons:** Lucide React (shadcn default, tree-shakeable SVG)

## Commit Style

- No Co-Authored-By lines
- No AI mention
- Focus on changes + impact only

## Enforcement (warnings → hard blocks)

- `npm run validate:tokens` — checks for hardcoded oklch/hex/rgb in `.tsx` files
- `scripts/validate-structure.sh` — checks inline constants, hardcoded colors
- ESLint — naming conventions, import patterns, no banned patterns

## Gotchas

- roslib 2.x is pure ESM — use named imports: `import { Ros, Topic } from 'roslib'`
- No barrel files — caused 68% module bloat in v2
- Dynamic rowHeight infinite loop (ISS-008) — use `window.innerHeight` for lg, static for md/sm
- Canvas 2D cannot resolve CSS vars directly — use `getComputedStyle()` fallback pattern
- Always gitignore BEFORE creating files with secrets
- Token namespace: only `--color-surface-*`, `--color-text-*`, `--color-accent*`, `--color-status-*`, `--color-border*` exist — never invent new namespaces
- Tailwind v4 theming: colors in `:root`/`[data-theme]`, token names registered via `@theme inline` — never put colors directly in `@theme`
