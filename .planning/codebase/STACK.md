# Technology Stack

**Analysis Date:** 2026-03-16

## Languages

**Primary:**

- TypeScript 5.9.3 - All application code (`package.json`, `tsconfig.app.json`)

**Secondary:**

- JSX/TSX - React component templates (`tsconfig.app.json`: jsx: "react-jsx")

## Runtime

**Environment:**

- Node.js - Development and build tooling
- Browser - Application runtime (SPA)
- No explicit version constraint (.nvmrc not present)

**Package Manager:**

- npm (indicated by `package-lock.json`)

## Frameworks

**Core:**

- React 19.2.4 - UI framework (`package.json`)
- React Router 7.13.1 - Client-side routing (`src/router/index.tsx`)
- Zustand 5.0.12 - State management with persist/devtools middleware (`src/stores/`)
- RxJS 7.8.2 - Reactive data streams for ROS topics (`src/services/ros/`)

**Testing:**

- Vitest 4.1.0 - Unit/integration tests with jsdom environment (`vite.config.ts`)
- @testing-library/react 16.3.2 - Component testing utilities
- @testing-library/jest-dom 6.9.1 - DOM assertion matchers
- Playwright 1.58.2 - E2E tests, Chromium only (`playwright.config.ts`)

**Build/Dev:**

- Vite 7.3.1 - Bundler and dev server (`vite.config.ts`)
- @vitejs/plugin-react 5.2.0 - React Fast Refresh
- @tailwindcss/vite 4.2.1 - Tailwind CSS integration

## Key Dependencies

**Critical:**

- roslib 1.4.1 - ROS WebSocket bridge client for robot communication (`src/services/ros/`)
- D3 7.9.0 - Data visualization for SLAM maps, IMU plots, time-series (`src/features/slam/`, `src/features/telemetry/`)
- react-grid-layout 2.2.2 - Draggable panel grid system (`src/features/panels/`)
- Sonner 2.0.7 - Toast notifications (`src/App.tsx`)
- fake-indexeddb 6.2.5 - IndexedDB mock for testing

**UI Framework:**

- TailwindCSS 4.2.1 - Utility-first CSS
- Radix UI - Headless component primitives (dialog, select, slider, tooltip, alert-dialog, label, separator, slot)
- class-variance-authority 0.7.1 - Component variant patterns
- clsx 2.1.1 + tailwind-merge 3.5.0 - Class name utilities
- Lucide React 0.545.0 - Icon library

## Configuration

**Environment:**

- No .env files used - configuration is hardcoded in `src/config/`
- `src/config/constants.ts` - Storage keys, app name/version
- `src/config/ros.ts` - ROS bridge connection parameters
- `src/config/webrtc.ts` - ICE servers, peer connection settings

**Build:**

- `vite.config.ts` - Vite bundler + Vitest test config
- `tsconfig.app.json` - TypeScript strict mode, ES2022 target, `@/*` path alias
- `eslint.config.js` - ESLint 9 flat config with TypeScript, React, a11y, import, Prettier plugins
- `.prettierrc` - Single quotes, semicolons, 80 char width, 2-space indent

**Code Quality:**

- ESLint 9.39.4 with typescript-eslint strict type checking
- Prettier 3.8.1 integrated via eslint-plugin-prettier
- Husky 9.1.7 + lint-staged 15.5.2 for pre-commit hooks

## Platform Requirements

**Development:**

- Any platform with Node.js
- No Docker or external services required
- Dev server: localhost:5173

**Production:**

- GitHub Pages - Static hosting
- Base path: `/robot-telemetry-dashboard/`
- Build output: ~210 KB JS gzipped, ~10 KB CSS gzipped

---

_Stack analysis: 2026-03-16_
_Update after major dependency changes_
