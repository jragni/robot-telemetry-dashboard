# Technology Stack

**Project:** Robot Telemetry Dashboard (v4)
**Researched:** 2026-03-22
**Overall Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React | 19.0.4 | UI framework | Latest stable (Jan 2026). React 19.1/19.2 exist but 19.0.4 is the security-patched baseline. Server Components irrelevant for this client-only app, but the improved `use()` hook and Actions API simplify async patterns. | HIGH |
| TypeScript | 5.9 | Type safety | GA August 2025. Deferred module evaluation (`import defer`) useful for lazy-loading heavy telemetry modules. Expandable hovers improve DX. No breaking changes from 5.7. | HIGH |
| Vite | 7.x (latest 7.x) | Build tool | **Use Vite 7, not Vite 8.** Vite 8 (March 12, 2026) switches to Rolldown bundler with CJS interop changes. roslib 2.0 is now ESM but react-grid-layout and other deps may have CJS transitive deps. Vite 7 with Rolldown opt-in (`rolldown` flag) gives a safe migration path. Upgrade to 8 mid-project once deps are validated. | HIGH |

**Vite 7 vs 8 Decision Rationale:** Vite 8 offers 10-30x faster builds via Rolldown, but introduces CJS interop breaking changes (`legacy.inconsistentCjsInterop: true` needed as workaround). For a greenfield project with robotics libraries, Vite 7 is the safe bet. Vite 7 already supports opt-in Rolldown integration for gradual migration.

### State & Data Layer

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zustand | 5.0.12 | UI state management | Latest stable. Uses native `useSyncExternalStore` (React 18+). Minimal API, no boilerplate. Validated in v2/v3 -- keep it. | HIGH |
| RxJS | 7.8.2 | Reactive data streams | Latest stable. RxJS 8 is in development (not released). 7.8.2 is production-proven for WebSocket stream processing. Perfect for rosbridge telemetry pipelines. | HIGH |
| roslib | 2.0.1 | ROS2 WebSocket transport | **Major upgrade from v1.** Now ESM-native (no more CJS gotcha!), built-in TypeScript types (drop `@types/roslib`), ROS 2 Action/TF support, async service callbacks. This eliminates the `optimizeDeps.include` workaround from v3. | HIGH |

**Data Flow (unchanged from v3):** roslib (transport) -> RxJS (stream processing) -> Zustand (UI state)

### UI Components

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| shadcn/ui | CLI v4 (March 2026) | Component library | Copy-paste components, fully themeable. CLI v4 adds presets (pack entire design system config into a code string), Radix + Base UI engine choice, RTL support. Use Radix engine for this project. | HIGH |
| radix-ui | 1.4.3 (unified package) | Accessible primitives | **Use unified `radix-ui` package**, not individual `@radix-ui/react-*` packages. Single import, better tree-shaking. February 2026 migration via shadcn. | HIGH |
| Recharts | 3.8.0 | Data visualization / plots | Best React chart library for telemetry plots. SVG-based, composable, good real-time update support. **Gotcha:** Requires `react-is` override for React 19 compatibility. | MEDIUM |
| react-grid-layout | 2.2.2 | Draggable dashboard panels | Still the standard for draggable/resizable grid layouts. **Gotcha:** React 19 fork exists (`react-grid-layout-19`) -- test compatibility before committing. Known ISS-008 infinite loop issue carries forward. | MEDIUM |

### Testing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vitest | 4.1.0 | Unit/integration tests | Latest stable (March 2026). Browser Mode now stable, visual regression testing built-in, Playwright Trace support. Pairs with Vite 7 natively. | HIGH |
| Playwright | 1.58.0 | E2E + visual assertions | Latest stable (Jan 2026). Now uses Chrome for Testing builds instead of Chromium. Playwright Agents for LLM-guided test generation. Critical for the 7-category visual assertion pipeline. | HIGH |

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.x | Utility-first CSS | shadcn/ui dependency. v4 uses CSS-first configuration, Lightning CSS engine. OKLCH color tokens work natively. | HIGH |
| CSS custom properties | -- | Design tokens | OKLCH color space for defense-contractor palette. Two font weights (400/600). Theme toggle via `data-theme` attribute. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | latest | Class name merging | Every component with conditional styles |
| lucide-react | latest | Icons | UI icons throughout dashboard |
| @tanstack/react-query | 5.x | Server state (optional) | Only if adding REST API endpoints later; not needed for pure WebSocket/roslib |
| framer-motion | latest | Animations | Page transitions, panel open/close. Use sparingly -- defense aesthetic is restrained. |
| zod | 3.x | Runtime validation | Validate rosbridge message shapes at boundary |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build tool | Vite 7 | Vite 8 | CJS interop breaking changes; wait for ecosystem to stabilize |
| Build tool | Vite 7 | Turbopack | Next.js-only, not standalone |
| State mgmt | Zustand 5 | Jotai | Zustand validated in v2/v3; no reason to switch. Jotai better for atomic state, not stream-fed dashboards |
| State mgmt | Zustand 5 | Redux Toolkit | Overkill for this app's state complexity |
| ROS transport | roslib 2.0 | @foxglove/roslibjs | Foxglove fork is 0.0.3, immature. Official roslib 2.0 has caught up on TS/ESM |
| ROS transport | roslib 2.0 | @breq/roslib | 0.1.5, experimental TypeScript port. roslib 2.0 now has native TS |
| Charts | Recharts 3.8 | Victory | Recharts has simpler API, better shadcn ecosystem integration |
| Charts | Recharts 3.8 | Chart.js | Canvas-based (good perf) but less React-idiomatic than Recharts |
| Charts | Recharts 3.8 | TanStack Charts | Too new, less community support for real-time patterns |
| Grid layout | react-grid-layout | CSS Grid | Need drag-and-drop panel rearrangement, not just static grid |
| Components | shadcn/ui + Radix | Tremor | Tremor is built on Recharts + Radix but too opinionated for defense aesthetic |
| Testing | Vitest 4 | Jest 30 | Vitest pairs natively with Vite, faster, same API surface |

## What NOT to Use

| Library | Why Not |
|---------|---------|
| `@types/roslib` | roslib 2.0 ships its own TypeScript types. Remove this dep. |
| Individual `@radix-ui/react-*` packages | Use unified `radix-ui` package instead |
| Barrel files (`index.ts` re-exports) | ADR-001: caused 68% module bloat in v2 |
| Next.js | Client-only app deployed to GitHub Pages. No SSR/SSG needed. |
| Electron | Web-only requirement. Robotics operators use browser. |
| Socket.IO | roslib handles WebSocket transport to rosbridge natively |
| D3 directly | Use Recharts (D3 wrapper) for React integration. Raw D3 for custom viz only. |

## Key Upgrade Notes from v3

| v3 Stack | v4 Stack | Migration Notes |
|----------|----------|-----------------|
| React 18 | React 19.0.4 | New `use()` hook, Actions. Check react-grid-layout compat. |
| TypeScript 5.7 | TypeScript 5.9 | No breaking changes. Add `import defer` for perf. |
| Vite 6 | Vite 7.x | Drop Node 18 support (need 20.19+). New `baseline-widely-available` browser target. |
| roslib 1.x (CJS) | roslib 2.0.1 (ESM) | **Remove `optimizeDeps.include` hack.** Drop `@types/roslib`. Update import patterns. |
| Zustand 4 | Zustand 5.0.12 | Uses `useSyncExternalStore`. Check migration guide for API changes. |
| Vitest (older) | Vitest 4.1.0 | Stable browser mode, visual regression testing |
| shadcn/ui + @radix-ui/react-* | shadcn/ui CLI v4 + unified radix-ui | Re-init with CLI v4 presets. Use unified radix-ui package. |

## Installation

```bash
# Core
npm install react@19.0.4 react-dom@19.0.4
npm install zustand@^5.0.12
npm install rxjs@^7.8.2
npm install roslib@^2.0.1

# UI
npx shadcn@latest init  # CLI v4, select Radix engine
npm install recharts@^3.8.0
npm install react-grid-layout@^2.2.2
npm install lucide-react
npm install clsx tailwind-merge
npm install zod@^3

# Dev
npm install -D typescript@~5.9
npm install -D vite@^7
npm install -D vitest@^4.1.0
npm install -D @playwright/test@^1.58.0
npm install -D tailwindcss@^4
npm install -D @types/react @types/react-dom
```

## Sources

- [React versions](https://react.dev/versions) - React 19.0.4 confirmed
- [TypeScript 5.9 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/) - GA August 2025
- [Vite releases](https://vite.dev/releases) - Vite 7 stable, Vite 8 March 2026
- [Vite 8 migration guide](https://vite.dev/guide/migration) - CJS interop breaking changes documented
- [Zustand v5 announcement](https://pmnd.rs/blog/announcing-zustand-v5) - useSyncExternalStore, drop React <18
- [RxJS npm](https://www.npmjs.com/package/rxjs) - 7.8.2 latest stable, v8 unreleased
- [roslib npm](https://www.npmjs.com/package/roslib) - 2.0.1, ESM-native, built-in TS types
- [roslibjs releases](https://github.com/RobotWebTools/roslibjs/releases) - v2.0 changelog
- [shadcn/ui CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) - March 2026
- [Radix UI unified package](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) - February 2026
- [Vitest 4.0 announcement](https://vitest.dev/blog/vitest-4) - Stable browser mode, visual regression
- [Playwright release notes](https://playwright.dev/docs/release-notes) - 1.58.0
- [Recharts npm](https://www.npmjs.com/package/recharts) - 3.8.0, React 19 react-is override needed
- [react-grid-layout npm](https://www.npmjs.com/package/react-grid-layout) - 2.2.2
