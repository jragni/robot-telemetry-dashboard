# Codebase Structure

**Analysis Date:** 2026-03-16

## Directory Layout

```
robot-telemetry-dashboard/
├── .planning/              # GSD project planning documents
│   └── codebase/          # Codebase analysis (this directory)
├── e2e/                    # Playwright E2E tests
├── public/                 # Static assets
├── src/                    # Application source code
│   ├── @types/            # Ambient type declarations
│   ├── assets/            # Static assets (images, etc.)
│   ├── components/        # Shared React components
│   │   ├── layout/       # App shells and navigation
│   │   ├── shared/       # Reusable domain components
│   │   └── ui/           # shadcn/ui primitives
│   ├── config/            # Application configuration
│   ├── features/          # Feature modules (domain logic)
│   │   ├── connections/  # Robot connection management
│   │   ├── control/      # Movement control
│   │   ├── fleet/        # Multi-robot overview
│   │   ├── panels/       # Dashboard panel grid system
│   │   ├── pilot-mode/   # FPOV operator interface
│   │   ├── recording/    # Data recording & playback
│   │   ├── slam/         # SLAM map visualization
│   │   └── telemetry/    # Sensor visualization
│   │       ├── data-plot/
│   │       ├── depth-camera/
│   │       ├── imu/
│   │       ├── lidar/
│   │       ├── shared/
│   │       └── topic-list/
│   ├── hooks/             # App-wide custom hooks
│   ├── lib/               # Shared utilities
│   ├── router/            # React Router configuration
│   ├── services/          # Business logic services
│   │   ├── ros/          # ROS communication
│   │   └── webrtc/       # WebRTC video streaming
│   ├── stores/            # Zustand state stores
│   ├── streams/           # RxJS stream definitions
│   ├── test/              # Test utilities & mocks
│   │   ├── mocks/        # Mock factories
│   │   └── utils/        # Test setup
│   ├── types/             # Shared TypeScript types
│   └── views/             # Route-level view components
├── eslint.config.js        # ESLint flat config
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── playwright.config.ts    # Playwright E2E config
├── tsconfig.app.json       # TypeScript config (app)
├── tsconfig.json           # TypeScript project references
├── tsconfig.node.json      # TypeScript config (tooling)
└── vite.config.ts          # Vite + Vitest config
```

## Directory Purposes

**src/components/layout/**

- Purpose: Application shell and navigation components
- Contains: `AppShell.tsx`, `DashboardShell.tsx`, `Header.tsx`
- Key pattern: DashboardShell wraps non-pilot routes with sidebar + header

**src/components/ui/**

- Purpose: shadcn/ui primitive components themed to defense-contractor aesthetic
- Contains: Button, Card, Dialog, Select, Input, Tooltip, Slider, AlertDialog, Label, Separator
- Key pattern: Built on Radix UI, styled with Tailwind + CVA variants

**src/components/shared/**

- Purpose: Reusable domain-specific components
- Contains: `StatusIndicator.tsx`, `DataCard.tsx`, `LoadingSpinner.tsx`

**src/features/**

- Purpose: Self-contained feature modules with components, hooks, types
- Contains: One directory per feature domain
- Key pattern: Each feature has `components/`, `hooks/`, `{feature}.types.ts`, `index.ts` barrel

**src/services/**

- Purpose: Singleton transport and communication services
- Contains: ROS and WebRTC transport classes, registries
- Key pattern: Registry → Transport → RxJS Observable emission

**src/stores/**

- Purpose: Zustand state management stores
- Contains: `connections.store.ts`, `ros.store.ts`, `webrtc.store.ts`, `control.store.ts`, `layout.store.ts`, `ui.store.ts`, `index.ts`
- Key pattern: Persist middleware for localStorage, devtools for debugging

**src/types/**

- Purpose: Shared TypeScript type definitions
- Contains: `connection.types.ts`, `ros-messages.ts`, `index.ts`
- Key pattern: ROS message types (Twist, LaserScan, IMU, OccupancyGrid, etc.)

**src/config/**

- Purpose: Application constants and service configuration
- Contains: `constants.ts`, `ros.ts`, `webrtc.ts`

**src/hooks/**

- Purpose: App-wide custom React hooks
- Contains: `useObservable.ts`, `useElementSize.ts`, `use-mobile.ts`

**src/lib/**

- Purpose: Shared utility functions
- Contains: `logger.ts` (structured logging), `utils.ts` (cn() class merge)

## Key File Locations

**Entry Points:**

- `index.html` - HTML shell
- `src/main.tsx` - React root creation
- `src/App.tsx` - App component with providers
- `src/router/index.tsx` - Route definitions

**Configuration:**

- `vite.config.ts` - Build + test config
- `tsconfig.app.json` - TypeScript strict config
- `eslint.config.js` - Linting rules
- `.prettierrc` - Code formatting
- `playwright.config.ts` - E2E test config

**Core Logic:**

- `src/services/ros/RosTransport.ts` - ROS connection lifecycle
- `src/services/ros/RosServiceRegistry.ts` - Per-robot transport manager
- `src/services/webrtc/WebRTCTransport.ts` - WebRTC connection lifecycle
- `src/features/panels/panel.registry.ts` - Widget type registry
- `src/features/recording/recording.service.ts` - IndexedDB recording engine

**Testing:**

- `src/test/utils/setup.ts` - Global test setup
- `src/test/mocks/roslib.mock.ts` - ROS mock factory
- `src/test/mocks/webrtc.mock.ts` - WebRTC mock factory
- `e2e/smoke.spec.ts` - E2E navigation tests

## Naming Conventions

**Files:**

- `PascalCase.tsx` - React components (e.g., `LidarWidget.tsx`, `PilotLayout.tsx`)
- `camelCase.ts` with `use` prefix - Hooks (e.g., `useLidarData.ts`, `useControlPublisher.ts`)
- `kebab-case.store.ts` - Zustand stores (e.g., `ros.store.ts`, `layout.store.ts`)
- `PascalCase.ts` - Service classes (e.g., `RosTransport.ts`, `RecordingService.ts`)
- `kebab-case.types.ts` - Type files (e.g., `panel.types.ts`, `recording.types.ts`)
- `kebab-case.utils.ts` - Utility files (e.g., `slam.utils.ts`, `export.utils.ts`)
- `*.test.ts` / `*.test.tsx` - Test files co-located with source

**Directories:**

- kebab-case for all directories (e.g., `pilot-mode/`, `data-plot/`, `topic-list/`)
- Feature modules: `{feature}/components/`, `{feature}/hooks/`

**Special Patterns:**

- `index.ts` barrel files for public API exports per feature
- `$` suffix for RxJS Observables (e.g., `connectionState$`, `mediaStream$`)
- `use{Feature}` naming for custom hooks

## Where to Add New Code

**New Feature:**

- Primary code: `src/features/{feature-name}/`
- Components: `src/features/{feature-name}/components/`
- Hooks: `src/features/{feature-name}/hooks/`
- Types: `src/features/{feature-name}/{feature-name}.types.ts`
- Barrel: `src/features/{feature-name}/index.ts`
- Tests: Co-located `*.test.ts` files

**New Panel Widget:**

- Widget component: `src/features/{domain}/components/{Name}Widget.tsx`
- Register in: `src/features/panels/panel.registry.ts`
- Default layout: `src/features/panels/panel.defaults.ts`

**New Zustand Store:**

- Store: `src/stores/{name}.store.ts`
- Tests: `src/stores/{name}.store.test.ts`
- Export from: `src/stores/index.ts`

**New ROS Service:**

- Service: `src/services/ros/{Name}.ts`
- Tests: `src/services/ros/{Name}.test.ts`
- Export from: `src/services/ros/index.ts`

**New View/Route:**

- View: `src/views/{Name}View.tsx`
- Route: Add to `src/router/index.tsx`

**Utilities:**

- Shared helpers: `src/lib/`
- Shared types: `src/types/`
- Shared hooks: `src/hooks/`

## Special Directories

**src/@types/**

- Purpose: Ambient type declarations for untyped modules
- Committed: Yes
- Note: Reserved for `.d.ts` files only

**src/test/**

- Purpose: Test infrastructure (setup, mocks)
- Committed: Yes
- Note: Not for actual test files (those are co-located)

**.planning/**

- Purpose: GSD project planning and codebase analysis
- Committed: Yes
- Note: Contains roadmap, state, summaries, codebase docs

---

_Structure analysis: 2026-03-16_
_Update when directory structure changes_
