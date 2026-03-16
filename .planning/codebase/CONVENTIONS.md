# Coding Conventions

**Analysis Date:** 2026-03-15

## Naming Patterns

**Files:**
- PascalCase.tsx for React components (`ConnectionsSidebar.tsx`, `IMUCard.tsx`)
- kebab-case.tsx for shadcn/ui primitives (`alert-dialog.tsx`, `field.tsx`)
- camelCase.ts with `use` prefix for hooks (`useRos.ts`, `useSubscriber.ts`)
- camelCase.ts for utilities and config (`globalHelpers.ts`, `ros.ts`)
- `definitions.ts`, `helpers.ts`, `constants.ts` for per-feature support files

**Functions:**
- camelCase for all functions (`deriveRosbridgeUrl`, `extractBaseUrl`)
- `on` prefix for event handlers (`onConnect`, `onClose`, `onTogglePilotMode`)
- `handle` prefix for UI interaction handlers (`handleDirectionPress`)
- `use` prefix for custom hooks (`useRos`, `useSubscriber`)
- No special prefix for async functions

**Variables:**
- camelCase for variables (`connectionState`, `activeRobotId`, `linearVelocity`)
- UPPER_SNAKE_CASE for constants (`STORAGE_KEY_ROBOTS`, `VELOCITY_LIMITS`, `CMD_VEL_MESSAGE_TYPE`)
- Underscore prefix for intentionally unused params (ESLint: `argsIgnorePattern: '^_'`)
- `const` preferred over `let` (ESLint: `prefer-const: 'error'`)

**Types:**
- PascalCase for interfaces and types, no `I` prefix
- `*Message` suffix for ROS message types (`TwistMessage`, `ImuMessage`, `LaserScanMessage`)
- `*Props` suffix for component props (`ConnectionsSidebarProps`, `ControlPanelProps`)
- `*State` suffix for state objects (`ControlState`)
- `*Config` suffix for configuration objects (`UseSubscriberConfig`)
- `*ContextValue` suffix for context values (`RosContextValue`, `WebRTCContextValue`)
- Union string literals for states: `type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'`

## Code Style

**Formatting (`.prettierrc`):**
- Prettier with `.prettierrc` config
- 80 character line length
- Single quotes for strings
- Semicolons required
- 2 space indentation
- Trailing commas in ES5 positions
- Arrow function parentheses always required
- LF line endings

**Linting (`eslint.config.js`):**
- ESLint 9 with flat config format
- typescript-eslint with strict type checking
- `@typescript-eslint/no-explicit-any: 'error'` - No `any` types allowed
- `@typescript-eslint/consistent-type-imports: 'warn'` - Use `import type`
- `prefer-const: 'error'`
- react-hooks/exhaustive-deps as warning
- jsx-a11y accessibility rules
- eslint-plugin-import with alphabetized ordering
- eslint-config-prettier to avoid conflicts
- Run: `npm run lint` / `npm run lint:fix`

**Pre-commit (Husky + lint-staged):**
- `.ts`/`.tsx` files: eslint --fix then prettier --write
- `.js`/`.jsx`/`.json`/`.css`/`.md` files: prettier --write only

## Import Organization

**Order (enforced by eslint-plugin-import):**
1. Builtin modules
2. External packages (`react`, `roslib`, `d3`)
3. Internal absolute paths (`@/hooks/...`, `@/contexts/...`)
4. Parent directories (`../`)
5. Sibling files (`./`)
6. Index files

**Grouping:**
- Alphabetized within each group
- Blank line between groups

**Type Imports:**
- `import type { SomeType } from 'module'` pattern enforced
- Separate from value imports

**Path Aliases:**
- `@/` maps to `src/` (configured in `tsconfig.app.json` and `vite.config.ts`)

## Error Handling

**Patterns:**
- try-catch in hooks and async operations
- Error state stored in hook return: `{ data, loading, error }`
- Context-level connection states: `'disconnected' | 'connecting' | 'connected' | 'error'`
- Errors logged: `console.error()` for debugging
- User-facing: Sonner toast notifications (`toast.error()`)

**Connection Errors:**
- Automatic retry with configurable max attempts (3)
- ROS: Fixed interval retry (3s)
- WebRTC: Exponential backoff (2s-30s)
- Manual disconnect prevents auto-reconnect

## Logging

**Framework:**
- Browser console (console.log, console.warn, console.error)
- No structured logging library

**Patterns:**
- Extensive logging in connection hooks (development-oriented)
- Toast notifications for user-facing status/errors
- No log levels or environment-based filtering

## Comments

**When to Comment:**
- JSDoc-style file headers for major modules
- JSDoc with `@param`, `@returns`, `@example` for utility functions
- Inline comments for non-obvious logic
- Minimal commenting overall - code is self-documenting

**TODO Comments:**
- Format: `// TODO: description`
- Many placeholder TODOs in empty helper files

## Function Design

**Size:**
- Most functions under 50 lines
- Some hooks are larger (useWebRTC ~425 lines) due to connection lifecycle complexity

**Parameters:**
- Config objects for hooks: `useSubscriber<T>(config: UseSubscriberConfig<T>)`
- Destructured props for components: `function Component({ prop1, prop2 }: Props)`

**Return Values:**
- Hooks return typed objects: `{ data, loading, error }` or `{ publish, isReady }`
- Early returns for guard clauses

## Module Design

**Exports:**
- Named exports preferred
- Default exports not used
- No barrel files (index.ts) - direct file imports
- Each context exports its Provider and custom hook

**Context Pattern:**
- `createContext<ContextValue | undefined>(undefined)`
- Provider component wraps children
- Custom hook with guard: `if (!context) throw new Error('...must be used within...Provider')`

**Generic Hooks:**
- `<T = unknown>` default type parameter
- Conditional enabling via `enabled` prop
- Cleanup via useEffect return

---

*Convention analysis: 2026-03-15*
*Update when patterns change*
