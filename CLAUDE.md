# Robot Telemetry Dashboard v2

Real-time ROS2 robot monitoring/control dashboard. React 19 + TypeScript 5.9 + Zustand 5 + RxJS 7 + Vite 7.

## Commands

```bash
npm run dev           # Dev server on localhost:5173
npm run build         # Typecheck + production build
npm test              # Run all 510 Vitest tests (single run)
npm run test:watch    # Vitest watch mode
npm run test:coverage # Coverage report (v8)
npm run e2e           # Playwright E2E (Chromium)
npm run lint          # ESLint 9 flat config
npm run lint:fix      # ESLint autofix
npm run format        # Prettier format all
npm run ci            # Full pipeline: lint + typecheck + test + build
```

## Architecture

Three-layer data flow: **roslib** (transport) -> **RxJS** (streams) -> **Zustand** (UI state)

- High-frequency data (IMU/LiDAR) uses `useObservable()` hook, bypasses Zustand to avoid re-render floods
- Per-robot singleton transports via Registry pattern (`RosServiceRegistry`, `WebRTCServiceRegistry`)
- Feature-module organization: `src/features/{domain}/` with components/, hooks/, types, barrel index.ts
- Panel registry system: widgets register in `src/features/panels/panel.registry.ts`

Routes: `/dashboard`, `/fleet`, `/map`, `/pilot/:robotId`

## Code Style

- **Formatting**: Prettier — single quotes, semicolons, 2-space indent, 80 char width
- **Linting**: ESLint 9 strict TypeScript — `no-explicit-any: error`, `no-floating-promises: error`
- **Imports**: `@/` = `src/`, use `import type {}` for type-only imports, blank lines between groups
- **No suppression**: Zero tolerance for `// @ts-ignore`, `eslint-disable`, or `as any`
- Pre-commit hooks: Husky + lint-staged (ESLint fix + Prettier on staged files)

## Naming Conventions

- `PascalCase.tsx` — React components (`LidarWidget.tsx`)
- `use{Feature}.ts` — Custom hooks (`useControlPublisher.ts`)
- `kebab-case.store.ts` — Zustand stores (`ros.store.ts`)
- `PascalCase.ts` — Service classes (`RosTransport.ts`)
- `kebab-case.types.ts` — Type files (`panel.types.ts`)
- `$` suffix — RxJS Observables (`connectionState$`, `mediaStream$`)
- `UPPER_SNAKE_CASE` — Constants (`TOPIC_THROTTLE_MS`)
- No `I` prefix on interfaces. Suffix with `Props`, `State`, `Actions`.

## Component Rules (IMPORTANT)

1. **One component per .tsx file** — no exceptions
2. **Types in `{ComponentName}.types.ts`** — ALL component-specific types, even single-field interfaces
3. **Comment-described sections -> sub-component files** — if it needs a `// ---- SectionName ----` comment, extract it
4. Decompose components exceeding ~100-150 lines of TSX
5. Named exports only (`export function`), no default exports
6. Barrel `index.ts` per feature for public API

## Testing

- **Framework**: Vitest 4 + jsdom + @testing-library/react
- **Co-located**: `*.test.ts` next to source (no `__tests__/` dirs)
- **Mocks**: `src/test/mocks/` for roslib/WebRTC, `fake-indexeddb` for IndexedDB
- **E2E**: Playwright 1.58 (Chromium only), config in `playwright.config.ts`
- **Pattern**: Arrange/Act/Assert, `beforeEach` with store reset + `vi.clearAllMocks()`
- **RxJS testing**: Subject maps for controlling Observable emission in tests

IMPORTANT: Run the FULL quality gate before proceeding to next phase. No phase advances without ALL passing:

```bash
npm run lint          # ZERO errors AND ZERO warnings — both are failures
npx tsc --noEmit     # ZERO type errors
npm test             # ALL tests passing
npm run build        # Production build succeeds
```

Lint warnings are real issues. Fix them with legitimate code changes — never suppress with `eslint-disable`, `@ts-ignore`, or `--max-warnings`.

## Gotchas

- **roslib is CommonJS** — requires `optimizeDeps.include` in vite.config.ts, will break on Vite upgrades
- **8-robot limit** — Fleet hooks use fixed 8-slot array for Rules of Hooks compliance. 9th+ robot silently ignored.
- **Placeholder views** — DashboardView and MapView are stubs. Phase 14 wires PanelGrid into them.
- **Recording UI unreachable** — Feature is built but has no route/panel entry point yet.
- **console.error in recording hooks** — Should use `createLogger()` from `src/lib/logger.ts`
- **No .env files** — Config is hardcoded in `src/config/` (ros.ts, webrtc.ts, constants.ts)
- **STUN servers hardcoded** — Google STUN URLs in `src/config/webrtc.ts`

## Key Files

- Entry: `src/main.tsx` -> `src/App.tsx` -> `src/router/index.tsx`
- ROS transport: `src/services/ros/RosTransport.ts`, `RosServiceRegistry.ts`
- WebRTC: `src/services/webrtc/WebRTCTransport.ts`
- Panel system: `src/features/panels/panel.registry.ts`, `panel.defaults.ts`
- Recording engine: `src/features/recording/recording.service.ts`
- Logger: `src/lib/logger.ts` (`createLogger(moduleName)`)
- Stores: `src/stores/` (connections, ros, webrtc, control, layout, ui)

## Project Status

- **Branch**: `EPIC/v2-rebuild` (base: `EPIC/refactor-for-quality-of-life`)
- **Phases 1-12**: Complete (510 tests, 0 TS errors, 0 ESLint errors)
- **Phase 13**: Pending — Component conventions refactoring (extract multi-component files)
- **Phase 14**: Pending — Wire DashboardView/MapView to PanelGrid, expose Recording UI

## Workflow

- **Main context = orchestrator** — plans, dispatches, verifies. Does NOT write code directly.
- Before each phase: spawn 3 parallel agents (Context, Investigation, Research). Wait for all.
- During phases: break into atomic subtasks, dispatch to expert agents by domain.
- Use `/gsd:` skills for phase planning and execution
- Use context7 MCP for current library docs, Playwright MCP for E2E
- Blockers: spawn research agent, find 5+ options, pick best, log decision, continue autonomously

### Post-Phase Quality Gate (MANDATORY)

IMPORTANT: After EVERY phase, run the full quality gate before proceeding. No exceptions.

1. **File audit** — list all created/modified files, verify naming + component rules
2. **Spec compliance** — compare work against the phase spec/PLAN.md, flag deviations
3. **Code review** — dispatch code-reviewer agent on all changed files
4. **Tests** — `npm run lint` + `npx tsc --noEmit` + `npm test` — all must pass, every new file needs a test
5. **E2E** — `npm run e2e` — if phase touches routes/views/UI features, write or update Playwright tests
6. **Fix loop** — if ANY remarks: create decimal sub-phases (N.1, N.2...) to fix, re-run full gate after each. Loop until zero remarks.

Audit report saved to `.planning/phases/{phase}/AUDIT.md`. See @.claude/references/workflow-preferences.md for full details.

## Deep Context

For detailed reference, see:

- @.planning/codebase/ARCHITECTURE.md — full architecture docs
- @.planning/codebase/CONVENTIONS.md — complete naming/style conventions
- @.planning/codebase/STRUCTURE.md — directory layout and where to add code
- @.planning/codebase/TESTING.md — test patterns, mocking strategies
- @.planning/codebase/CONCERNS.md — tech debt, known issues, scaling limits
- @.planning/codebase/STACK.md — full dependency list with versions
- @.planning/codebase/INTEGRATIONS.md — external APIs and data storage
- @.planning/ROADMAP.md — 14-phase roadmap with all phase details
- @.planning/PROJECT.md — requirements, constraints, key decisions
