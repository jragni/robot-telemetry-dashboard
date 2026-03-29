# Folder Structure

Organized by **feature domain**, not by file type.

## Layout

```
src/
├── features/                     # Feature domains — each owns everything it needs
│   ├── fleet/                    # Fleet overview, robot cards, add/remove
│   │   ├── FleetOverview.tsx
│   │   ├── FleetOverview.types.ts
│   │   ├── FleetOverview.test.tsx
│   │   ├── fleet.constants.ts    # Feature-scoped constants
│   │   ├── fleet.helpers.ts      # Feature-scoped utility functions
│   │   ├── useFleetFilter.ts     # Feature-scoped hook
│   │   ├── RobotCard/            # Complex component → own folder (3+ subcomponents)
│   │   │   ├── RobotCard.tsx
│   │   │   ├── RobotCard.types.ts
│   │   │   ├── RobotCard.constants.ts
│   │   │   ├── RobotCard.test.tsx
│   │   │   ├── RobotStatusBadge.tsx
│   │   │   └── RobotDeleteButton.tsx
│   │   ├── AddRobotModal.tsx
│   │   └── AddRobotModal.types.ts
│   ├── workspace/                # Robot telemetry workspace
│   │   ├── RobotWorkspace.tsx
│   │   ├── useWorkspaceLayout.ts # Feature-scoped store/hook
│   │   └── ...
│   ├── controls/                 # E-Stop, velocity, D-pad
│   ├── telemetry/                # IMU, charts, LiDAR, raw values
│   ├── demo/                     # Demo mode with mock robots
│   └── landing/                  # Landing page
├── shared/                       # Cross-feature infrastructure (used by 2+ features)
│   ├── components/               # Shared UI (AppShell, Sidebar, Header, StatusBar)
│   ├── hooks/                    # Shared hooks (useTheme, etc.)
│   ├── stores/                   # Zustand stores used across features
│   │   └── connection/           # Connection store (used by fleet + sidebar)
│   └── types/                    # Shared types (ROS messages, etc.)
├── components/ui/                # shadcn/ui components (generated, not hand-written)
├── test-utils/                   # Mock data generators, test helpers
├── utils/                        # Pure utility functions (shared across features)
├── index.css                     # Design system tokens (@theme + :root)
├── main.tsx                      # React entry point
└── App.tsx                       # Router + top-level layout
```

## Rules

### Feature Ownership

- **Features own their code.** Components, hooks, helpers, stores, constants, tests, and types used by only one feature live inside that feature's folder.
- **Shared only if used by 2+ features.** Don't prematurely move things to `shared/`. Start local, promote when needed.
- **Feature-scoped stores:** If a store is only used by one feature (e.g., `useWorkspaceLayout`), it lives in that feature folder — not in `shared/stores/`.

### Component Complexity

- **3+ subcomponents → own folder.** When a component has 3 or more child components, it gets its own directory.
- **If a child needs a comment to describe what it is, extract it into a named subcomponent.** Self-describing component names replace comments.

### No Barrel Files (ADR-001)

Import directly from source: `import { RobotCard } from '../fleet/RobotCard/RobotCard'`

### shadcn-First Rule

Use shadcn/ui components before building custom ones. Check if shadcn has a component that fits before writing from scratch. Custom components only when shadcn doesn't cover the use case.

**Installed:** Button, Card, Input, Badge, Dialog
**Available to add:** Sidebar, Tabs, Select, Tooltip, Popover, Sheet, etc. (`npx shadcn@latest add <name>`)
**Location:** `src/components/ui/` — these are shadcn's files, imported via `@/components/ui/`

## File Naming

| Type       | Convention                                   | Example                                        |
| ---------- | -------------------------------------------- | ---------------------------------------------- |
| Components | PascalCase `.tsx`                            | `RobotCard.tsx`                                |
| Types      | PascalCase `.types.ts`                       | `RobotCard.types.ts`                           |
| Helpers    | camelCase or feature-scoped `.helpers.ts`    | `RobotCard.helpers.ts`, `fleet.helpers.ts`     |
| Hooks      | camelCase `use*.ts`                          | `useTheme.ts`, `useFleetFilter.ts`             |
| Tests      | matches source `.test.tsx` / `.test.ts`      | `RobotCard.test.tsx`                           |
| Stores     | camelCase `use*Store.ts`                     | `useConnectionStore.ts`                        |
| Constants  | PascalCase or feature-scoped `.constants.ts` | `RobotCard.constants.ts`, `fleet.constants.ts` |
| Utilities  | camelCase `.ts`                              | `quaternion.ts`                                |

## Scoping Rules

Helpers, constants, hooks, stores, and types all follow the same scoping pattern:

- **Component-scoped:** `RobotCard/RobotCard.helpers.ts` — only used by that component
- **Feature-scoped:** `fleet/fleet.helpers.ts` — used across the feature
- **Shared:** `shared/` or `utils/` — used across 2+ features

Start local, promote when a second consumer appears. Never prematurely share.
