# Where to Add New Code

## New Feature

```
src/features/{feature-name}/
  components/{Name}.tsx           # One component per file
  components/{Name}.types.ts      # All component-specific types
  hooks/use{Feature}.ts           # Custom hooks
  {feature-name}.types.ts         # Shared feature types
  {feature-name}.utils.ts         # Utility functions (if needed)
  index.ts                        # Barrel exports (public API only)
```

## New Panel Widget

1. Create widget component: `src/features/{domain}/components/{Name}Widget.tsx`
2. Register in: `src/features/panels/panel.registry.ts`
3. Add default layout: `src/features/panels/panel.defaults.ts`

## New Zustand Store

1. Store: `src/stores/{name}.store.ts`
2. Tests: `src/stores/{name}.store.test.ts`
3. Export from: `src/stores/index.ts`
4. Pattern: `persist` middleware for localStorage, `devtools` for debugging

## New ROS Service

1. Service: `src/services/ros/{Name}.ts`
2. Tests: `src/services/ros/{Name}.test.ts`
3. Export from: `src/services/ros/index.ts`

## New View/Route

1. View: `src/views/{Name}View.tsx`
2. Route: Add to `src/router/index.tsx`
3. Wrap in `DashboardShell` for sidebar+header (unless fullscreen like PilotView)

## Shared Utilities

- Shared helpers: `src/lib/`
- Shared types (ROS messages, etc.): `src/types/`
- Shared hooks: `src/hooks/`
- Ambient type declarations: `src/@types/` (.d.ts files only)

## Testing New Code

- Co-locate test: `{source-name}.test.ts` next to implementation
- Mock roslib: use patterns from `src/test/mocks/roslib.mock.ts`
- Mock WebRTC: use patterns from `src/test/mocks/webrtc.mock.ts`
- Mock IndexedDB: use `fake-indexeddb` package
- Store tests: call `getState()` directly, no rendering needed
- Hook tests: `renderHook()` from @testing-library/react
- RxJS tests: Subject maps for controlling Observable emission
