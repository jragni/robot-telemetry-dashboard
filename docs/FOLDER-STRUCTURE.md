# Folder Structure

Organized by **feature domain**, not by file type. Enforced by `eslint-plugin-boundaries`.

## Three-Tier Architecture

```
┌─────────────────────────────┐
│           APP               │  src/App.tsx, src/main.tsx
│   (router — glue layer)     │  Can import: everything
└─────────┬───────────────────┘
          │ imports from
┌─────────▼───────────────────┐
│        FEATURES             │  src/features/{domain}/
│  (fleet, workspace, demo)   │  Can import: shared layers, OWN feature
│  Cannot import OTHER features│
└─────────┬───────────────────┘
          │ imports from
┌─────────▼───────────────────┐
│     SHARED (src/*)          │  src/components/, src/hooks/, src/stores/,
│  Direct children of src/    │  src/lib/, src/types/, src/utils/
│  Cannot import features or app│
└─────────────────────────────┘
```

**Data flows one direction only.** A feature cannot import from another feature. Shared code cannot import from features. This is enforced by ESLint at lint time — violations are errors, not warnings.

## Layout

```
src/
├── components/                   # Shared components (AppShell, Header, Sidebar, etc.)
│   ├── AppShell.tsx
│   ├── Header.tsx
│   ├── Header.types.ts
│   ├── Sidebar.tsx
│   ├── Sidebar.types.ts
│   ├── Sidebar.constants.ts
│   ├── StatusBar.tsx
│   └── ui/                       # shadcn/ui components — NEVER hand-edit
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── select.tsx
├── hooks/                        # Shared hooks
│   └── useTheme.ts
├── stores/                       # Shared Zustand stores
│   └── connection/
│       ├── useConnectionStore.ts
│       ├── useConnectionStore.types.ts
│       └── useConnectionStore.helpers.ts
├── lib/                          # Shared utilities (cn, etc.)
│   └── utils.ts
├── types/                        # Shared types (ROS messages, etc.)
├── utils/                        # Pure utility functions
├── features/                     # Feature domains — each owns everything it needs
│   ├── fleet/                    # Fleet overview, robot cards, add/remove
│   │   ├── FleetOverview.tsx     # Page component (lives at feature root)
│   │   ├── helpers.ts            # Feature-scoped helpers (NOT fleet.helpers.ts)
│   │   ├── constants.ts          # Feature-scoped constants
│   │   ├── types/                # All feature types — never inline or co-located
│   │   │   ├── RobotCard.types.ts
│   │   │   ├── AddRobotModal.types.ts
│   │   │   ├── RobotDeleteButton.types.ts
│   │   │   └── RobotStatusBadge.types.ts
│   │   ├── components/           # UI components (no .types.ts here)
│   │   │   ├── FleetEmptyState.tsx
│   │   │   ├── AddRobotModal.tsx
│   │   │   └── RobotCard/
│   │   │       ├── RobotCard.tsx
│   │   │       ├── RobotCard.constants.ts
│   │   │       ├── RobotStatusBadge.tsx
│   │   │       └── RobotDeleteButton.tsx
│   │   └── mocks/                # Dev views and mock components
│   │       └── FleetDevView.tsx
│   ├── workspace/                # Robot telemetry workspace
│   │   ├── RobotWorkspace.tsx    # Page component
│   │   ├── constants.ts          # Feature-scoped constants
│   │   ├── types/                # All feature types
│   │   │   ├── WorkspacePanel.types.ts
│   │   │   └── WorkspaceGrid.types.ts
│   │   ├── components/           # UI components (no .types.ts here)
│   │   │   ├── WorkspacePanel.tsx
│   │   │   └── WorkspaceGrid.tsx
│   │   └── mocks/                # Dev views and mock components
│   │       ├── MockCamera.tsx
│   │       ├── MockImu.tsx
│   │       ├── WorkspaceDevView.tsx
│   │       └── ...
│   ├── landing/                  # Landing page
│   │   ├── LandingPage.tsx       # Page component
│   │   ├── constants.ts          # Feature-scoped constants
│   │   ├── types/                # All feature types
│   │   │   └── LandingPage.types.ts
│   │   └── components/           # Subcomponents
│   │       ├── LandingHero.tsx
│   │       ├── LandingHeader.tsx
│   │       └── ...
│   ├── demo/                     # Demo mode with mock robots
│   └── controls/                 # E-Stop, velocity, D-pad (deferred)
├── test-utils/                   # Mock data generators, test helpers
├── index.css                     # Design system tokens (@theme + :root)
├── main.tsx                      # React entry point
└── App.tsx                       # Router + top-level layout
```

## Rules

### Feature Ownership

- **Features own their code.** Components, hooks, helpers, stores, constants, tests, and types used by only one feature live inside that feature's folder.
- **Shared only if used by 2+ features.** Don't prematurely move things to shared directories. Start local, promote when needed.
- **Feature-scoped stores:** If a store is only used by one feature (e.g., `useWorkspaceLayout`), it lives in that feature folder — not in `src/stores/`.

### Component Complexity

- **3+ subcomponents → own folder.** When a component has 3 or more child components, it gets its own directory.
- **If a child needs a comment to describe what it is, extract it into a named subcomponent.** Self-describing component names replace comments.

### Barrel Files (ADR-001 revised)

**No feature-level barrels** — don't create `src/features/fleet/index.ts` re-exporting an entire feature. This caused 68% module bloat in v2 with webpack.

**Yes to component-folder barrels** — component folders with subcomponents should have an `index.ts` that exports the main component as default and subcomponents as named exports:

```ts
// src/features/workspace/components/ControlsPanel/index.ts
export { ControlsPanel } from './ControlsPanel';
export { VelocitySlider } from './VelocitySlider';
```

```ts
// Consumer:
import { ControlsPanel } from './components/ControlsPanel';
// NOT: import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
```

**Yes to directory barrels for hooks** — `src/hooks/index.ts` re-exports all shared hooks for clean multi-import:

```ts
// Consumer:
import { useImuSubscription, useLidarSubscription, useBatterySubscription } from '@/hooks';
// NOT: three separate import lines from @/hooks/useImuSubscription, etc.
```

Vite/Rollup tree-shakes these correctly. The v2 problem was giant feature-level barrels with webpack, not focused component/directory barrels.

### shadcn-First Rule

Use shadcn/ui components before building custom ones. Check if shadcn has a component that fits before writing from scratch. Custom components only when shadcn doesn't cover the use case.

**Installed:** Button, Card, Input, Badge, Dialog, Select
**Available to add:** Sidebar, Tabs, Tooltip, Popover, Sheet, etc. (`npx shadcn@latest add <name>`)
**Location:** `src/components/ui/` — these are shadcn's files, **never hand-edit them**

### shadcn Import Fix

shadcn CLI may write files to a literal `./@/` directory instead of `src/`. After running `npx shadcn@latest add <name>`:

1. Check if the file landed in `./@/components/ui/` instead of `src/components/ui/`
2. If so, move it: `mv ./@/components/ui/<name>.tsx src/components/ui/`
3. Fix the utils import from `@/lib/utils` to `../../lib/utils`
4. Clean up: `rm -rf ./@`

## File Naming

| Type       | Convention                                                    | Example                                  |
| ---------- | ------------------------------------------------------------- | ---------------------------------------- |
| Components | PascalCase `.tsx`                                             | `RobotCard.tsx`                          |
| Types      | PascalCase `.types.ts` in feature `types/` folder             | `types/RobotCard.types.ts`               |
| Helpers    | `helpers.ts` at feature root, or `{Component}.helpers.ts`     | `helpers.ts`, `RobotCard.helpers.ts`     |
| Hooks      | camelCase `use*.ts`                                           | `useTheme.ts`, `useFleetFilter.ts`       |
| Tests      | matches source `.test.tsx` / `.test.ts`                       | `RobotCard.test.tsx`                     |
| Stores     | camelCase `use*Store.ts`                                      | `useConnectionStore.ts`                  |
| Constants  | `constants.ts` at feature root, or `{Component}.constants.ts` | `constants.ts`, `RobotCard.constants.ts` |
| Utilities  | camelCase `.ts`                                               | `quaternion.ts`                          |

## Scoping Rules

Helpers, constants, hooks, stores, and types all follow the same scoping pattern:

- **Component-scoped:** `RobotCard/RobotCard.helpers.ts` — only used by that component
- **Feature-scoped:** `fleet/helpers.ts` or `fleet/constants.ts` — used across the feature (no feature-name prefix)
- **Shared:** `src/hooks/`, `src/stores/`, `src/lib/`, etc. — used across 2+ features

Start local, promote when a second consumer appears. Never prematurely share.

## Import Ordering

Three groups separated by blank lines. Within each group: hooks → 3rd party components → `@/` components → types. Alphabetize by import name. React is always first.

```ts
// 3rd party — React first, then hooks, libraries, types
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import type { Ros } from 'roslib';

// Aliased — hooks → 3rd party components → @/ components → types
import { useBatterySubscription } from '@/hooks/useBatterySubscription';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { Activity, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PanelId } from '@/features/workspace/types/panel.types';

// Relative — hooks → components → types
import { useMinimizedPanels } from './hooks/useMinimizedPanels';
import { SystemStatusPanel } from './components/SystemStatusPanel';
import type { WorkspaceProps } from './types/Workspace.types';
```

## Dev Routes

Dev routes live under `/dev/*` and serve two purposes:

| Route             | Purpose                                                                                                                           | Example                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/dev/components` | **Individual component demos** — isolated components shown outside their page context. Buttons, cards, modals, empty states, etc. | Fleet cards in all states, AddRobotModal standalone                    |
| `/dev/{feature}`  | **Full section mock** — shows how the feature actually looks assembled, with selectors to toggle variants.                        | `/dev/workspace` shows the 2×3 grid with live IMU, system status, etc. |

**Rule:** Components are demoed individually at `/dev/components`. The assembled view of how a section looks lives at `/dev/{feature}` (e.g., `/dev/workspace`, `/dev/fleet`).

Each dev view should include links to related dev pages for easy navigation.
