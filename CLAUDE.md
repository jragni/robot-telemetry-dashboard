# Robot Telemetry Dashboard — V4

## Process: Disciplined Autonomy

ALL GSD gates are enabled in `.planning/config.json`. Do not set any gate to `false`. YOLO mode stays on for autonomous execution within phases. Every phase transition requires human approval.

Full process spec: `docs/superpowers/specs/2026-03-22-v4-process-design.md`

## UI Tool Chain (MANDATORY for visual/integration phases)

Every `visual` or `integration` phase MUST execute these 6 steps in order. Skipping a step is a process violation.

1. **`/gsd:ui-phase`** — Generate UI-SPEC.md design contract with render rules, responsive behavior, states, acceptance criteria
2. **`/ui-ux-pro-max`** — Design system decisions (color, typography, spacing, layout). Defense-contractor aesthetic. Outputs specific token values.
3. **21st.dev Magic MCP** (`mcp___21st-dev_magic__21st_magic_component_builder`) — Pull components from curated registry. Skip only if component is too custom for the registry.
4. **`/frontend-design`** — Production-grade implementation with anti-AI-slop filter. Must follow UI-SPEC.md contract. Must use design tokens, not hardcoded values.
5. **`/gsd:ui-review`** — 6-pillar visual audit. Must score 7+ on AI Slop, Defense Aesthetic, and Polish to proceed.
6. **Playwright MCP** — Screenshots at 1280x800 + 375x812. Saved to `.planning/screenshots/`. Presented to human at `confirm_transition`.

## Quality Gate (EVERY phase — logic, visual, and integration)

```bash
npm run lint && npx tsc --noEmit && npm test -- --run && npx playwright test e2e/visual-gate.spec.ts && npm run build
```

All 5 must pass with ZERO errors and ZERO warnings.

## Phase Classification

| Type | UI Tool Chain | Human Reviews |
|------|--------------|---------------|
| `logic` | Not required | Test results + diff → quick "go" |
| `visual` | ALL 6 steps mandatory | Screenshots + diff → pass/fail |
| `integration` | ALL 6 steps mandatory | Route-by-route screenshots + diff → pass/fail |

## Code Conventions

- One component per `.tsx` file
- Types in `{ComponentName}.types.ts`
- No barrel files (ADR-001) — import directly from source
- Stores in domain folders (ADR-002)
- No `@ts-ignore`, `eslint-disable`, `as any`
- Named exports only
- Two font weights: 400 (body), 600 (headings)

## Commit Style

- No Co-Authored-By lines
- No AI mention
- Focus on changes + impact only

## Architecture

- **Data layer:** roslib (transport) → RxJS (streams) → Zustand (UI state)
- **Design:** Defense-contractor aesthetic (dark charcoal + electric blue)
- **Stack:** React 19, TypeScript 5.9, Vite 7, shadcn/ui + Radix, Vitest, Playwright

## Gotchas

- roslib is CommonJS — needs `optimizeDeps.include` in Vite config
- No barrel files — caused 68% module bloat in v2
- Dynamic rowHeight infinite loop (ISS-008) — use `window.innerHeight` for lg, static for md/sm
- Always gitignore BEFORE creating files with secrets
