# Testing

## Co-location

- **Tests live next to the code they test.** `Component.test.tsx` next to `Component.tsx`.
- **If 3+ test files** exist for one component/feature, create a `__tests__/` subfolder.
- **Feature tests stay in the feature folder.** Don't put fleet tests in a global test directory.

## Unit Tests

- **Cover all edge cases.** Not just happy path — test error states, empty states, boundary values, loading states.
- **One test file per component/hook/store.** Named `{source}.test.tsx` or `{source}.test.ts`.
- **Test behavior, not implementation.** Assert what the user sees, not internal state.

## Integration Tests

- **No mocking the store.** Use the real Zustand store with test data.
- **Test the real component tree.** Integration tests render the actual component with its children, not mocked subcomponents.

## E2E Tests

- **Playwright** for route-level integration.
- **Verify real components render** — not placeholders or "coming soon" text.
- **Visual gate tests** capture screenshots at 1280x800 (desktop) and 375x812 (mobile).
- **Use `domcontentloaded`** not `networkidle` for page waits.

## Test Utilities

- Mock data generators live in `src/test-utils/`.
- Shared test helpers (render wrappers, store seeders) live in `src/test-utils/`.
- Feature-specific test helpers live in the feature folder.

## Quality Gate

```bash
npm run lint && npx tsc --noEmit && npm test -- --run && npm run build
```

All must pass with ZERO errors and ZERO warnings.
