# Phase 1: Scaffolding - Research

**Researched:** 2026-03-23
**Domain:** Vite 7 + React 19 + TypeScript project scaffolding, dependency verification, test infrastructure
**Confidence:** HIGH

## Summary

Phase 1 is a clean-slate rebuild: delete all v3 Next.js code, scaffold a Vite 7 + React 19 + TypeScript 5.9 project, install all dependencies, configure ESLint 9 flat config with strict type checking, set up Husky/lint-staged/Prettier, initialize shadcn/ui with Tailwind CSS v4, and establish Vitest + Playwright test infrastructure.

The most significant research finding is that **roslib 2.0.1 is now pure ESM** -- the CJS interop problems from v1/v2 no longer apply. The `optimizeDeps.include` hack documented in CLAUDE.md is no longer needed for roslib 2.x. The second key finding is that **recharts 3.x** (current latest: 3.8.0) lists `react-is` as a peerDependency, so you install `react-is@^19.0.0` alongside React 19 rather than using npm overrides. The third finding is that **shadcn/ui now uses Tailwind CSS v4** which integrates directly as a Vite plugin -- no `postcss.config.js` or `tailwind.config.js` needed.

**Primary recommendation:** Use Vite 7.x (latest 7.2.x), React 19, TypeScript 5.9.3, recharts 3.8.x with react-is@^19, roslib 2.0.1 (pure ESM, no special Vite config), and shadcn/ui with Tailwind CSS v4 via @tailwindcss/vite plugin.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Clean slate -- delete everything except `.planning/`, `CLAUDE.md`, `docs/`, `.git/`, `.gitignore`
- **D-02:** Delete v3 audit screenshots -- no visual references carried forward
- **D-03:** Pre-commit hooks via Husky + lint-staged (ESLint + Prettier on staged files)
- **D-04:** Fresh `npx shadcn@latest init` for Vite -- no v3 shadcn config carried forward
- **D-05:** ESLint 9 flat config (`eslint.config.js`) using `defineConfig` -- no legacy `.eslintrc`
- **D-06:** `typescript-eslint` with `strictTypeChecked` + `stylisticTypeChecked` presets (maximum strictness)
- **D-07:** `parserOptions.projectService: true` for type-aware linting via TypeScript's built-in project service
- **D-08:** Prettier with auto-format on save (VS Code config) + pre-commit hook via lint-staged
- **D-09:** `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` included (provisional)
- **D-10:** roslib only -- import-level Vitest test verifying ESM import + `Ros` constructor exists
- **D-11:** No smoke tests for Recharts or react-grid-layout
- **D-12:** Recharts for standard charts, D3 for custom viz -- both installed in Phase 1
- **D-13:** Single Playwright file: `visual-gate.spec.ts` (living quality gate)
- **D-14:** `visual-gate.spec.ts` starts with: app renders, root has children, no console errors, `toHaveScreenshot()` baseline

### Claude's Discretion
- Exact Vite config options and plugin setup
- tsconfig.json structure and compiler options
- Vitest and Playwright config details
- Directory structure under `src/`
- Which shadcn/ui components to install initially (if any beyond init)
- Exact smoke test component implementations
- `.prettierrc` formatting rules

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | ^7.2.2 | Build tool + dev server | Project spec requires Vite 7; latest 7.x is 7.2.2. Vite 8 exists but is a major version with Rolldown migration -- stay on 7 per spec |
| @vitejs/plugin-react | latest | React Fast Refresh + JSX transform | Official Vite React plugin |
| react | ^19.0.0 | UI framework | Project spec requires React 19 |
| react-dom | ^19.0.0 | DOM renderer | Paired with React 19 |
| typescript | ~5.9.3 | Type system | Project spec requires TS 5.9; 5.9.3 is latest stable. TS 6.0 exists but is a major version |

### UI & Visualization

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | ^4.0.0 | Utility CSS framework | Required by shadcn/ui; v4 integrates as Vite plugin |
| @tailwindcss/vite | latest | Vite plugin for Tailwind v4 | Replaces postcss.config.js + tailwind.config.js |
| tw-animate-css | latest | Animation utilities | Replaces deprecated tailwindcss-animate for Tailwind v4 |
| recharts | ^3.8.0 | Standard charts (time-series) | Latest stable; React 19 compatible via react-is peer dep |
| react-is | ^19.0.0 | React type checking (recharts peer dep) | Must match React version; recharts 3.x requires as peer dep |
| d3 | ^7.9.0 | Custom viz (LiDAR radar, IMU widget) | D-12 decision; latest stable |
| react-grid-layout | ^2.2.2 | Panel grid layout | v2.0 TypeScript rewrite with hooks API; peer dep react >= 16.3 |

### Data Layer

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| roslib | ^2.0.1 | ROS WebSocket transport | **Now pure ESM** -- no CJS interop issues. Named exports: `import { Ros } from "roslib"` |
| rxjs | ^7.8.0 | Stream processing | Data pipeline architecture (roslib -> RxJS -> Zustand) |
| zustand | ^5.0.0 | UI state management | Lightweight, React 19 compatible |

### Linting & Formatting

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| eslint | ^9.0.0 | Linter | D-05: flat config required |
| @eslint/js | latest | ESLint base recommended rules | Used with defineConfig |
| typescript-eslint | latest | TS parser + rules | D-06: strictTypeChecked + stylisticTypeChecked |
| eslint-plugin-react-hooks | latest | React hooks rules | D-09: provisional |
| eslint-plugin-react-refresh | ^0.5.2 | Fast Refresh validation | D-09: provisional |
| prettier | ^3.0.0 | Code formatter | D-08 |
| eslint-config-prettier | latest | Disables ESLint rules that conflict with Prettier | Prevents ESLint/Prettier fights |

### Dev Tooling

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| husky | latest | Git hooks | D-03 |
| lint-staged | latest | Run linters on staged files | D-03 |
| vitest | ^4.1.0 | Unit/integration testing | Vite-native test runner; v4 compatible with Vite 7 |
| @testing-library/react | latest | React component testing | Standard React testing utils |
| @testing-library/jest-dom | latest | DOM assertion matchers | Extends Vitest with DOM assertions |
| jsdom | latest | DOM environment for Vitest | Required for React component tests |
| @playwright/test | ^1.58.0 | E2E + visual regression | D-13/D-14: visual-gate.spec.ts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vite 7 | Vite 8 (Rolldown) | Vite 8 is bleeding edge with Rolldown migration; project spec says Vite 7 |
| TypeScript 5.9 | TypeScript 6.0 | TS 6.0 just released; 5.9 is stable and matches project spec |
| recharts 3.x | recharts 2.15.x | 2.x requires npm overrides for react-is; 3.x uses peer dep (cleaner) |
| tailwindcss-animate | tw-animate-css | tailwindcss-animate is deprecated for Tailwind v4 |

**Installation:**
```bash
# Core
npm install react react-dom react-is

# UI & Visualization
npm install recharts d3 react-grid-layout

# Data layer
npm install roslib rxjs zustand

# Dev dependencies
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/d3
npm install -D tailwindcss @tailwindcss/vite tw-animate-css
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-config-prettier prettier
npm install -D husky lint-staged
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                 # App root component, providers
│   └── App.tsx
├── components/          # Shared UI components
│   └── ui/              # shadcn/ui components (auto-generated)
├── features/            # Feature-based domain folders
│   ├── connection/      # roslib connection management
│   ├── fleet/           # Robot fleet state
│   ├── telemetry/       # Telemetry data streams
│   └── control/         # Robot control commands
├── hooks/               # Shared custom hooks
├── lib/                 # Utility functions
├── types/               # Global type definitions
├── styles/              # Global CSS (index.css with Tailwind)
└── main.tsx             # Entry point
e2e/
└── visual-gate.spec.ts  # Living Playwright quality gate
```

### Pattern 1: Vite 7 Config with Tailwind v4

**What:** Minimal vite.config.ts with React plugin and Tailwind v4 Vite plugin
**When to use:** Always -- this is the project foundation

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Pattern 2: ESLint 9 Flat Config with Strict TypeChecked

**What:** ESLint flat config with typescript-eslint strict presets
**When to use:** D-05 through D-09

```typescript
// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'e2e/'] },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
```

### Pattern 3: roslib 2.x ESM Import

**What:** Direct named ESM imports from roslib 2.0.1
**When to use:** All roslib usage

```typescript
// roslib 2.x is pure ESM -- no CJS interop needed
import { Ros, Topic, Message } from 'roslib';

// Create connection
const ros = new Ros({ url: 'ws://localhost:9090' });
```

**CRITICAL CHANGE from v1/v2:** roslib 2.0.1 is pure ESM. The `optimizeDeps.include: ['roslib']` hack from previous versions is NO LONGER NEEDED. Do not add roslib to optimizeDeps.

### Pattern 4: Tailwind CSS v4 (No Config Files)

**What:** Tailwind v4 uses CSS-first configuration via @theme directive
**When to use:** All styling

```css
/* src/index.css */
@import "tailwindcss";

/* Custom theme values will be added in Phase 2 via @theme */
```

No `tailwind.config.js` or `postcss.config.js` needed. Tailwind v4 integrates via the Vite plugin.

### Anti-Patterns to Avoid
- **Barrel files (index.ts re-exports):** ADR-001 -- caused 68% module bloat in v2. Import directly from source files.
- **`optimizeDeps.include: ['roslib']`:** No longer needed with roslib 2.x ESM. Adding it is harmless but misleading.
- **`tailwind.config.js`:** Tailwind v4 uses CSS-first config. Creating a JS config file is the old way.
- **`postcss.config.js`:** Not needed with @tailwindcss/vite plugin.
- **`require('roslib')` or `import ROSLIB from 'roslib'`:** roslib 2.x uses named exports only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS utility classes | Custom CSS-in-JS | Tailwind CSS v4 + shadcn/ui | Design token consistency, zero-runtime |
| Component primitives | Custom buttons/inputs/dialogs | shadcn/ui (Radix + Tailwind) | Accessible, themeable, copy-paste ownership |
| Git hooks | Manual `.git/hooks/` scripts | Husky | Cross-platform, team-friendly |
| Staged file linting | Custom pre-commit scripts | lint-staged | Handles partial staging, file filtering |
| Path aliases | Manual relative paths | Vite `resolve.alias` + tsconfig `paths` | Clean imports (`@/components/...`) |
| Test environment | Custom JSDOM setup | Vitest `environment: 'jsdom'` | Built-in, zero config |

## Common Pitfalls

### Pitfall 1: Tailwind v4 Config Confusion
**What goes wrong:** Creating `tailwind.config.js` or `postcss.config.js` alongside the Vite plugin
**Why it happens:** Every tutorial from 2024 and earlier shows the old config approach
**How to avoid:** Use `@tailwindcss/vite` plugin ONLY. Theme customization goes in CSS via `@theme` directive.
**Warning signs:** Duplicate config files, Tailwind not applying styles

### Pitfall 2: roslib Import Syntax (v1/v2 Habits)
**What goes wrong:** Using `import ROSLIB from 'roslib'` (default export) or `require('roslib')`
**Why it happens:** roslib 1.x used UMD/CJS with a default ROSLIB namespace object
**How to avoid:** Use named imports: `import { Ros, Topic } from 'roslib'`
**Warning signs:** `undefined` when accessing `ROSLIB.Ros`, TypeScript import errors

### Pitfall 3: react-is Version Mismatch with Recharts
**What goes wrong:** Recharts charts render as blank/empty with no console errors
**Why it happens:** recharts 3.x peer-depends on react-is; if react-is version doesn't match React version, internal type checks fail silently
**How to avoid:** Install `react-is@^19.0.0` explicitly alongside React 19
**Warning signs:** Recharts components mount but render nothing; ResponsiveContainer appears empty

### Pitfall 4: ESLint strictTypeChecked + Missing tsconfig
**What goes wrong:** ESLint crashes with "project service" errors on files not covered by tsconfig
**Why it happens:** `projectService: true` requires every linted file to be included in a tsconfig
**How to avoid:** Ensure `eslint.config.js`, `vite.config.ts`, `vitest.config.ts`, and `playwright.config.ts` are covered. Use a separate `tsconfig.node.json` for config files.
**Warning signs:** ESLint errors mentioning "not part of any project"

### Pitfall 5: Vitest 4.x + Vite 7.1.x TypeScript Error
**What goes wrong:** TypeScript error about missing `createImportMeta` property on `ModuleRunnerOptions`
**Why it happens:** Type mismatch between Vitest 4.x and certain Vite 7.1.x patch versions
**How to avoid:** Pin Vite to ^7.2.2 (latest 7.x) which resolves this. If hit, verify Vite version alignment.
**Warning signs:** `tsc --noEmit` fails on vitest config types

### Pitfall 6: shadcn/ui Init Before Tailwind
**What goes wrong:** shadcn CLI generates wrong config or fails
**Why it happens:** The CLI inspects package.json for Tailwind to determine configuration approach
**How to avoid:** Install Tailwind v4 + @tailwindcss/vite FIRST, then run `npx shadcn@latest init`
**Warning signs:** Missing CSS variables, wrong component output

## Code Examples

### roslib 2.x Smoke Test (Vitest)
```typescript
// src/__tests__/roslib-smoke.test.ts
import { describe, it, expect } from 'vitest';
import { Ros, Topic, Message } from 'roslib';

describe('roslib ESM import', () => {
  it('exports Ros constructor', () => {
    expect(Ros).toBeDefined();
    expect(typeof Ros).toBe('function');
  });

  it('exports Topic constructor', () => {
    expect(Topic).toBeDefined();
    expect(typeof Topic).toBe('function');
  });

  it('exports Message constructor', () => {
    expect(Message).toBeDefined();
    expect(typeof Message).toBe('function');
  });

  it('can instantiate Ros without connecting', () => {
    // Ros constructor should not throw when given a URL
    // (actual connection happens on .connect() or lazily)
    const ros = new Ros({ url: 'ws://localhost:9090' });
    expect(ros).toBeDefined();
  });
});
```

### Vitest Configuration
```typescript
// vitest.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### visual-gate.spec.ts Starter
```typescript
// e2e/visual-gate.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Gate', () => {
  test('app renders without blank screen', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    // Root must have children (not blank)
    const children = await root.locator('> *').count();
    expect(children).toBeGreaterThan(0);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('screenshot baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('app-baseline.png');
  });
});
```

### Husky + lint-staged Setup
```json
// package.json (partial)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

```bash
# Setup commands
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| roslib CJS + `optimizeDeps.include` | roslib 2.x pure ESM + named imports | Dec 2024 (roslib 2.0.0) | No Vite workaround needed; use `import { Ros } from 'roslib'` |
| recharts 2.x + npm overrides for react-is | recharts 3.x + react-is as peer dep | 2025 (recharts 3.0) | Install react-is@^19 as regular dep; no overrides |
| Tailwind config (tailwind.config.js + postcss) | Tailwind v4 + @tailwindcss/vite plugin | Jan 2025 (Tailwind 4.0) | CSS-first config via @theme; no JS config files |
| tailwindcss-animate | tw-animate-css | Tailwind v4 era | Old package deprecated |
| ESLint .eslintrc + extends | ESLint 9 flat config (eslint.config.js) | ESLint 9.0 | Use defineConfig, spread configs, no extends |
| `import ROSLIB from 'roslib'` | `import { Ros, Topic } from 'roslib'` | roslib 2.0 | Named exports only; default export removed |
| react-grid-layout WidthProvider HOC | react-grid-layout 2.x useContainerWidth hook | Dec 2025 (RGL 2.0) | Hooks-based API; WidthProvider replaced |

**Deprecated/outdated:**
- `tailwindcss-animate`: Use `tw-animate-css` instead
- `postcss.config.js` for Tailwind: Use `@tailwindcss/vite` plugin
- `optimizeDeps.include: ['roslib']`: roslib 2.x is ESM, not CJS
- `WidthProvider` from react-grid-layout: Use `useContainerWidth` hook in v2.x

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.x + Playwright 1.58.x |
| Config file | `vitest.config.ts` (Wave 0) + `playwright.config.ts` (Wave 0) |
| Quick run command | `npx vitest run` |
| Full suite command | `npm run lint && npx tsc --noEmit && npx vitest run && npx playwright test e2e/visual-gate.spec.ts && npm run build` |

### Phase Requirements -> Test Map

Phase 1 has no formal requirement IDs (infrastructure foundation). Validation is against success criteria:

| Criteria | Behavior | Test Type | Automated Command | File Exists? |
|----------|----------|-----------|-------------------|-------------|
| SC-1 | Dev server renders React component | E2E | `npx playwright test e2e/visual-gate.spec.ts` | Wave 0 |
| SC-2 | Production build zero errors | Build | `npm run build` | N/A (npm script) |
| SC-3 | At least one Vitest test passes | Unit | `npx vitest run` | Wave 0 |
| SC-4 | Playwright captures screenshot | E2E | `npx playwright test e2e/visual-gate.spec.ts` | Wave 0 |
| SC-5 | roslib imports without errors | Unit | `npx vitest run src/__tests__/roslib-smoke.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run && npx tsc --noEmit`
- **Per wave merge:** `npm run lint && npx tsc --noEmit && npx vitest run && npx playwright test e2e/visual-gate.spec.ts && npm run build`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- test runner configuration
- [ ] `playwright.config.ts` -- E2E test configuration
- [ ] `src/test-setup.ts` -- shared test setup (jest-dom matchers)
- [ ] `e2e/visual-gate.spec.ts` -- living quality gate
- [ ] `src/__tests__/roslib-smoke.test.ts` -- roslib ESM import verification
- [ ] Playwright browsers install: `npx playwright install chromium`

## Open Questions

1. **Vitest 4.x + Vite 7.1.x type compatibility**
   - What we know: A GitHub issue reports TypeScript errors with certain Vite 7.1.x + Vitest 4.x combinations
   - What's unclear: Whether Vite 7.2.2 fully resolves this
   - Recommendation: Pin `vite@^7.2.2`, test `tsc --noEmit` early. If types conflict, use `skipLibCheck: true` temporarily.

2. **roslib 2.0.1 Ros constructor behavior without connection**
   - What we know: roslib 2.x removed Web Worker mode and non-WebSocket transports; constructor API changed
   - What's unclear: Whether `new Ros({ url })` throws or connects lazily in 2.x
   - Recommendation: The smoke test (D-10) will verify this. If constructor behavior changed, adapt test accordingly.

3. **react-grid-layout 2.x types**
   - What we know: v2.0 is a TypeScript rewrite with built-in types
   - What's unclear: Whether `@types/react-grid-layout` should still be installed or conflicts with built-in types
   - Recommendation: Do NOT install `@types/react-grid-layout` -- v2.x ships its own types. If installed, it will likely conflict.

## Sources

### Primary (HIGH confidence)
- [recharts package.json (main branch)](https://github.com/recharts/recharts/blob/main/package.json) -- Verified react-is is peerDependency in 3.x
- [Vite 7 announcement](https://vite.dev/blog/announcing-vite7) -- Breaking changes, Node.js requirements
- [typescript-eslint shared configs](https://typescript-eslint.io/users/configs/) -- strictTypeChecked + stylisticTypeChecked setup
- [shadcn/ui Vite installation](https://ui.shadcn.com/docs/installation/vite) -- Official Vite setup steps
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) -- tw-animate-css, @theme directive
- [react-grid-layout GitHub](https://github.com/react-grid-layout/react-grid-layout) -- v2.0 hooks API, useContainerWidth
- [roslib GitHub v2 branch](https://github.com/RobotWebTools/roslibjs/tree/v2) -- ESM-only, named exports, Transport API

### Secondary (MEDIUM confidence)
- [Vitest 4.0 blog](https://vitest.dev/blog/vitest-4) -- Vite 7 compatibility from Vitest 3.2+
- [eslint-plugin-react-hooks npm](https://www.npmjs.com/package/eslint-plugin-react-hooks) -- Flat config support
- [Vite npm versions](https://www.npmjs.com/package/vite?activeTab=versions) -- Latest 7.x is 7.2.2 (Vite 8.0.1 is latest overall)

### Tertiary (LOW confidence)
- [Vitest 4.x + Vite 7.1.x type error](https://github.com/vitest-dev/vitest/releases) -- Reported issue, unclear if resolved in 7.2.2

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All versions verified against npm registry and official docs
- Architecture: HIGH -- Patterns derived from official documentation (shadcn/ui Vite guide, typescript-eslint docs, roslib v2 docs)
- Pitfalls: HIGH -- roslib CJS->ESM transition verified; recharts react-is issue verified with current package.json; Tailwind v4 config change verified
- Vitest/Vite type compat: MEDIUM -- Single issue report, may be resolved in 7.2.2

**Research date:** 2026-03-23
**Valid until:** 2026-04-22 (30 days -- stable ecosystem, no fast-moving dependencies)
