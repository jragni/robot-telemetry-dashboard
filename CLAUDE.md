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

### Quality Gate

```bash
npm run lint && npx tsc --noEmit && npm run build
```

All must pass with ZERO errors and ZERO warnings. Add `npm test -- --run` and `npm run validate:tokens` once test infrastructure grows.

## Folder Structure

Organized by **feature domain**, not by file type.

```
src/
├── features/                     # Feature domains — each owns its components, hooks, tests
│   ├── fleet/                    # Fleet overview, robot cards, add/remove
│   │   ├── FleetOverview.tsx
│   │   ├── FleetOverview.types.ts
│   │   ├── FleetOverview.test.tsx
│   │   ├── fleet.helpers.ts      # Feature-scoped utility functions
│   │   ├── RobotCard/            # Complex component → own folder (3+ subcomponents)
│   │   │   ├── RobotCard.tsx
│   │   │   ├── RobotCard.types.ts
│   │   │   ├── RobotCard.helpers.ts
│   │   │   ├── RobotCard.test.tsx
│   │   │   ├── RobotStatusBadge.tsx
│   │   │   └── ConnectionInfo.tsx
│   │   ├── AddRobotModal.tsx
│   │   └── AddRobotModal.types.ts
│   ├── workspace/                # Robot telemetry workspace
│   ├── controls/                 # E-Stop, velocity, D-pad
│   ├── telemetry/                # IMU, charts, LiDAR, raw values
│   ├── demo/                     # Demo mode with mock robots
│   └── landing/                  # Landing page
├── shared/                       # Cross-feature infrastructure
│   ├── components/               # Shared UI (AppShell, Sidebar, Header, StatusBar)
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── StatusBar.tsx
│   ├── hooks/                    # Shared hooks (useTheme, etc.)
│   ├── stores/                   # Zustand stores by domain
│   │   └── connection/           # Connection store
│   └── types/                    # Shared types (ROS messages, etc.)
├── test-utils/                   # Mock data generators, test helpers
├── utils/                        # Pure utility functions (shared across features)
├── index.css                     # Design system tokens (@theme + :root)
├── main.tsx                      # React entry point
└── App.tsx                       # Router + top-level layout
```

### Folder Rules

- **Features own their code.** Components, hooks, helpers, tests, and types used by only one feature live inside that feature's folder.
- **Shared only if used by 2+ features.** Don't prematurely move things to `shared/`. Start local, promote when needed.
- **3+ subcomponents → own folder.** When a component has 3 or more child components, it gets its own directory.
- **No barrel files (ADR-001).** Import directly from source: `import { RobotCard } from '../fleet/RobotCard/RobotCard'`

### File Naming

| Type       | Convention                                | Example                                    |
| ---------- | ----------------------------------------- | ------------------------------------------ |
| Components | PascalCase `.tsx`                         | `RobotCard.tsx`                            |
| Types      | PascalCase `.types.ts`                    | `RobotCard.types.ts`                       |
| Helpers    | camelCase or feature-scoped `.helpers.ts` | `RobotCard.helpers.ts`, `fleet.helpers.ts` |
| Hooks      | camelCase `use*.ts`                       | `useTheme.ts`                              |
| Tests      | matches source `.test.tsx` / `.test.ts`   | `RobotCard.test.tsx`                       |
| Stores     | camelCase `use*Store.ts`                  | `useConnectionStore.ts`                    |
| Utilities  | camelCase `.ts`                           | `quaternion.ts`                            |

### Helpers Convention

Helpers contain scoped utility/transform functions — not components, not hooks.

- **Component-scoped:** `RobotCard/RobotCard.helpers.ts` — only used by that component
- **Feature-scoped:** `fleet/fleet.helpers.ts` — used across multiple components in the feature
- **Shared:** `utils/` — used across features

If a helper is only used locally, keep it local. Promote to feature-scoped or shared when a second consumer appears.

## Code Conventions

### File Rules

- One component per `.tsx` file
- Types in `{ComponentName}.types.ts` (same directory)
- No barrel files (ADR-001) — import directly from source
- Named exports only
- No `@ts-ignore`, `eslint-disable`, `as any`
- **If a child needs a comment to describe what it is, extract it into a named subcomponent.** Self-describing component names replace comments.
- **If a component has 3+ subcomponents, it gets its own folder.**

### Testing Rules

- **Co-located tests.** `Component.test.tsx` lives next to `Component.tsx`.
- **If 3+ test files** exist for one component/feature, create a `__tests__/` subfolder.
- **Unit tests cover all edge cases.** Not just happy path — test error states, empty states, boundary values, loading states.
- **E2E tests** via Playwright for route-level integration (does the page render real components, not placeholders?).
- **No mocking the store in integration tests** — use the real store with test data.

### Styling Rules

- **All colors via Tailwind utilities** — `bg-surface-primary`, `text-accent`, `border-border`. For values not in @theme, use `var(--color-*)` from index.css.
- **Never hardcode** hex, rgb, or oklch values in components
- **All fonts** via `font-sans` (Exo) or `font-mono` (Roboto Mono) utilities
- **Font sizes strictly 12/14/20/36px** — no exceptions. Map: `text-xs`=12, `text-sm`=14, `text-xl`=20, `text-4xl`=36
- **Two font weights only:** 400 (`font-normal`) and 600 (`font-semibold`)
- **Surface glow** on every panel: `shadow-[inset_0_1px_0_0_var(--color-surface-glow)]`
- **Border radius** max 2px (`rounded-sm`) — no large radii
- **Interactive elements:** `cursor-pointer`, `transition-all duration-200`, `focus-visible:outline-2 focus-visible:outline-accent`
- **prefers-reduced-motion** respected — use `motion-safe:` prefix for animations

### Component Pattern

```tsx
// src/features/fleet/RobotCard/RobotCard.tsx
import type { RobotCardProps } from './RobotCard.types';
import { RobotStatusBadge } from './RobotStatusBadge';
import { ConnectionInfo } from './ConnectionInfo';

export function RobotCard({ robot }: RobotCardProps) {
  return (
    <div className="bg-surface-primary border border-border rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)] p-4">
      <RobotStatusBadge status={robot.status} />
      <ConnectionInfo url={robot.url} latency={robot.latency} />
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
- **Icons:** Lucide React (shadcn default, tree-shakeable SVG)

## Commit Style

- No Co-Authored-By lines
- No AI mention
- Focus on changes + impact only

## Enforcement (warnings → hard blocks)

Validation scripts catch violations. Currently warnings, will be promoted to pre-commit blocks once stable.

- `npm run validate:tokens` — checks for hardcoded oklch/hex/rgb in `.tsx` files
- `npm run validate:structure` — checks folder conventions, naming, missing `.types.ts` files
- ESLint — naming conventions, import patterns, no banned patterns

## Gotchas

- roslib 2.x is pure ESM — use named imports: `import { Ros, Topic } from 'roslib'`
- No barrel files — caused 68% module bloat in v2
- Dynamic rowHeight infinite loop (ISS-008) — use `window.innerHeight` for lg, static for md/sm
- Canvas 2D cannot resolve CSS vars directly — use `getComputedStyle()` fallback pattern
- Always gitignore BEFORE creating files with secrets
- Token namespace: only `--color-surface-*`, `--color-text-*`, `--color-accent*`, `--color-status-*`, `--color-border*` exist — never invent new namespaces
- Tailwind v4 theming: colors in `:root`/`[data-theme]`, token names registered via `@theme inline` — never put colors directly in `@theme`
