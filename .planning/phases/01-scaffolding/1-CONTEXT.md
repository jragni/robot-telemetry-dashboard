# Phase 1: Scaffolding - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Vite 7 project with all dependencies verified, test infrastructure, and CI quality gate. Clean slate rebuild -- delete all v3 Next.js code and start fresh with the v4 stack. Every dependency (roslib, Recharts, react-grid-layout) must be proven working with React 19 via smoke tests before moving to Phase 2.

</domain>

<decisions>
## Implementation Decisions

### V3 artifact handling
- **D-01:** Clean slate -- delete everything except `.planning/`, `CLAUDE.md`, `docs/`, `.git/`, `.gitignore`
- **D-02:** Delete v3 audit screenshots -- no visual references carried forward
- **D-03:** Pre-commit hooks via Husky + lint-staged (ESLint + Prettier on staged files)
- **D-04:** Fresh `npx shadcn@latest init` for Vite -- no v3 shadcn config carried forward

### Linting and formatting
- **D-05:** ESLint 9 flat config (`eslint.config.js`) using `defineConfig` -- no legacy `.eslintrc`
- **D-06:** `typescript-eslint` with `strictTypeChecked` + `stylisticTypeChecked` presets (maximum strictness)
- **D-07:** `parserOptions.projectService: true` for type-aware linting via TypeScript's built-in project service
- **D-08:** Prettier with auto-format on save (VS Code config) + pre-commit hook via lint-staged
- **D-09:** `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` included (provisional -- may be removed in future audit)

### Dependency verification
- **D-10:** roslib only -- import-level Vitest test verifying CJS->ESM interop + `ROSLIB.Ros` constructor exists. roslib has broken across every version transition (v1 `window.ROSLIB` hack, v2 `optimizeDeps.include`). The one dependency with proven history of breakage.
- **D-11:** No smoke tests for Recharts or react-grid-layout -- zero recorded render-level issues across v1/v2/v3. Real bugs (ISS-008 infinite loop, onLayoutChange race) were behavioral, not import/render failures. The quality gate (`tsc --noEmit` + `npm run build`) catches bundling issues. Real feature tests in Phases 7-8 will catch rendering issues with actual app components.
- **D-12:** Recharts for standard charts (time-series plots), D3 for custom viz (LiDAR radar, IMU widget) -- both installed in Phase 1
- **D-13:** Single Playwright file: `visual-gate.spec.ts` (living quality gate that accumulates structural checks each phase). No separate `smoke.spec.ts` -- the visual gate covers "app renders, not blank" from day one.
- **D-14:** `visual-gate.spec.ts` starts with: app renders, root has children, no console errors, `toHaveScreenshot()` baseline. Grows every phase with structural assertions.

### Claude's Discretion
- Exact Vite config options and plugin setup
- tsconfig.json structure and compiler options
- Vitest and Playwright config details
- Directory structure under `src/`
- Which shadcn/ui components to install initially (if any beyond init)
- Exact smoke test component implementations
- `.prettierrc` formatting rules

</decisions>

<specifics>
## Specific Ideas

- The v3 post-mortem ("468 tests passed on a broken blank screen") informed the decision to skip ceremony smoke tests -- the bugs that killed v2/v3 were behavioral/integration issues, not import/render failures
- `visual-gate.spec.ts` is the living safety net -- starts minimal in Phase 1, grows every phase
- ESLint strict mode chosen specifically because v3's lax linting allowed broken code through
- roslib is the only dependency with a proven history of breaking across version transitions -- warrants an explicit smoke test
- Recharts and react-grid-layout will get real render coverage when features use them (Phases 7-8)

</specifics>

<canonical_refs>
## Canonical References

### Project and process
- `.planning/PROJECT.md` -- Core value, constraints, architecture decisions, known gotchas
- `.planning/ROADMAP.md` Phase 1 -- Success criteria (5 items), dependency chain, phase type (`logic`)
- `CLAUDE.md` -- Code conventions, commit style, quality gate command, UI tool chain rules
- `docs/superpowers/specs/2026-03-22-v4-process-design.md` -- Full v4 process spec (Disciplined Autonomy)

### Architecture decisions
- `CLAUDE.md` ADR-001 -- No barrel files (caused 68% module bloat in v2)
- `CLAUDE.md` ADR-002 -- Stores in domain folders
- `CLAUDE.md` ISS-008 -- Dynamic rowHeight infinite loop (use `window.innerHeight` for lg, static for md/sm)

### Known gotchas
- roslib is CommonJS -- needs `optimizeDeps.include` in Vite config
- `WidthProvider` from react-grid-layout breaks with resizable sidebar -- use `useContainerWidth` hook
- Always gitignore BEFORE creating files with secrets

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None -- clean slate rebuild from empty `src/`

### Established Patterns
- None yet -- Phase 1 establishes all patterns for subsequent phases

### Integration Points
- `.planning/` directory must be preserved through clean slate deletion
- `CLAUDE.md` and `docs/` must be preserved
- `.gitignore` must be updated for Vite (remove Next.js entries, add Vite-specific)

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 01-scaffolding*
*Context gathered: 2026-03-23*
