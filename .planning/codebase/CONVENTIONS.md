# Coding Conventions

**Analysis Date:** 2026-03-16

## Naming Patterns

**Files:**

- PascalCase.tsx for React components (`LidarWidget.tsx`, `PilotLayout.tsx`)
- camelCase with `use` prefix for hooks (`useLidarData.ts`, `useControlPublisher.ts`)
- kebab-case.store.ts for stores (`ros.store.ts`, `layout.store.ts`)
- PascalCase.ts for service classes (`RosTransport.ts`, `RecordingService.ts`)
- kebab-case.types.ts for types (`panel.types.ts`, `recording.types.ts`)
- kebab-case.utils.ts for utilities (`slam.utils.ts`, `export.utils.ts`)
- \*.test.ts co-located alongside source files

**Functions:**

- camelCase for all functions
- `handle{Action}` for event handlers
- `use{Feature}` for custom hooks
- `create{Thing}` for factory functions (`createTopicSubscription`, `createLogger`)

**Variables:**

- camelCase for variables
- UPPER_SNAKE_CASE for constants (`TOPIC_THROTTLE_MS`, `DEFAULT_ICE_SERVERS`)
- `$` suffix for RxJS Observables (`connectionState$`, `mediaStream$`)

**Types:**

- PascalCase for interfaces and type aliases (`RobotConnection`, `ConnectionState`)
- No `I` prefix on interfaces
- Suffix with `Props`, `State`, `Actions` for component/store types
- `PanelTypeId` union type for panel identifiers

## Code Style

**Formatting:**

- Prettier via `.prettierrc`
- 80 character line length
- Single quotes for strings
- Semicolons required
- 2-space indentation
- Arrow parens: always
- End of line: LF

**Linting:**

- ESLint 9 flat config (`eslint.config.js`)
- Extends: typescript-eslint strict type checking
- Key rules:
  - `@typescript-eslint/no-explicit-any`: error
  - `@typescript-eslint/no-floating-promises`: error
  - `@typescript-eslint/no-misused-promises`: error
  - `@typescript-eslint/consistent-type-imports`: prefer type-imports
  - `eqeqeq`: always
  - `no-var`: error
  - `prefer-const`: error
  - `no-debugger`: error
- Plugins: react-hooks, react-refresh, jsx-a11y, import, prettier
- Run: `npm run lint`

## Import Organization

**Order:**

1. External packages (react, rxjs, zustand, d3)
2. Internal modules (@/lib, @/stores, @/services)
3. Relative imports (./components, ../hooks)
4. Type imports (import type {})

**Grouping:**

- Blank line between groups
- eslint-plugin-import enforces ordering with newlines between: builtin, external, internal, parent, sibling, index

**Path Aliases:**

- `@/` maps to `src/` (configured in `tsconfig.app.json` and `vite.config.ts`)

## Error Handling

**Patterns:**

- RxJS: Error callbacks in `.subscribe({ error: ... })` at subscription boundaries
- Transports: Exponential backoff retry with max attempts, BehaviorSubject error state
- Stores: Per-robot error state with message + timestamp
- UI: Sonner toast notifications for user-visible errors
- Disconnect safety: `DisconnectGuard` component triggers e-stop on connection loss

**Error Types:**

- Connection errors stored in Zustand stores per robot
- Transport errors emit via RxJS BehaviorSubject
- Recording errors caught in try/catch within async handlers

## Logging

**Framework:**

- Custom structured logger: `src/lib/logger.ts`
- Factory: `createLogger(moduleName)` returns prefixed logger instance

**Patterns:**

- Module-prefixed messages: `[RosTransport] Connected to robot-1`
- Environment-based log levels
- Note: Some recording hooks still use `console.error` directly (should migrate)

## Comments

**When to Comment:**

- Section headers with 79-char separator lines (`// -------- Section Name --------`)
- JSDoc for public API functions with `@example` tags
- Inline comments for non-obvious logic (ROS workarounds, browser API quirks)

**JSDoc/TSDoc:**

- Used on public service methods and exported hooks
- `@param`, `@returns` tags on complex functions

**TODO Comments:**

- Format: `// TODO: description`
- Few TODOs present (codebase is post-build)

## Function Design

**Size:**

- Components: Decompose over ~100-150 lines of TSX
- Functions: Extract helpers for complex logic

**Parameters:**

- Destructure props in React components
- Options objects for 3+ parameters
- `robotId` as first parameter convention for per-robot functions

**Return Values:**

- Explicit returns
- Early returns for guard clauses
- Hooks return objects with named fields

## Module Design

**Exports:**

- Named exports preferred
- `export function` for components (no default exports)
- Barrel `index.ts` files re-export public API per feature

**Barrel Files:**

- Every feature has `index.ts` for public exports
- Keep internal components private (only export via index)
- `src/stores/index.ts` re-exports all stores

---

_Convention analysis: 2026-03-16_
_Update when patterns change_
