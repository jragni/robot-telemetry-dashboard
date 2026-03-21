---
title: SPEC — Mobile UX Polish (Phase 7.2)
date: 2026-03-21
status: ready-for-implementation
phase: 07.2-mobile-ux-polish
---

# Mobile UX Polish — Phase 7.2

## Audit Findings (375×812 viewport)

Five issues identified from visual audit:

| #   | Issue                                                                   | Severity |
| --- | ----------------------------------------------------------------------- | -------- |
| 1   | Panels stack vertically — no swipeable carousel with dot indicators     | High     |
| 2   | Engineer mode visible on mobile — must be hidden                        | High     |
| 3   | Controls layout cramped at 375px — E-stop, d-pad, sliders all competing | High     |
| 4   | Empty vertical space below IMU/Data Plot tabs, above bottom bar         | Medium   |
| 5   | Mode switcher in header takes space — could be eliminated on mobile     | Medium   |

---

## Fix 1: Swipeable Panel Carousel

### Current state

`PilotMobileLayout` (line 49, `PilotMode.tsx`) renders a flex overflow container for telemetry cards. It is not a true carousel — no snap, no dot indicators, no embla.

### Target behavior

- Use `shadcn Carousel` (embla) already at `src/components/ui/carousel.tsx`
- Cards fill 100% viewport width (`basis-full`)
- Horizontal swipe snaps to each card
- Dot indicator row below the carousel showing position (e.g., `● ○ ○`)
- Cards: Video+Instruments (card 0), Controls (card 1), IMU (card 2), Data Plot (card 3)
- Active dot highlighted with `text-primary`; inactive dots `text-muted-foreground`

### Implementation notes

- Wrap in `<Carousel opts={{ align: 'start', loop: false }}>` with horizontal orientation
- Each `<CarouselItem>` is `basis-full h-full`
- Add a `CarouselDots` sub-component that reads `api.selectedScrollSnap()` and `api.scrollSnapList().length`
- The existing `CarouselPrevious` / `CarouselNext` buttons should NOT be rendered on mobile (arrows are desktop-only)
- Carousel must fill the available height between the instrument strip and the bottom bar — use `flex-1 min-h-0`

### Data-testid requirements

```
data-testid="pilot-mobile-carousel"         — Carousel root
data-testid="pilot-mobile-carousel-dots"    — dot indicator container
data-testid="pilot-mobile-card-{n}"         — each CarouselItem (0-indexed)
data-testid="pilot-mobile-dot-{n}"          — each dot
```

---

## Fix 2: Engineer Mode Hidden on Mobile

### Current state

`DashboardView.tsx` (line 21) renders `<EngineerMode />` when `currentMode === 'engineer'` regardless of `isMobile`. `ModeSwitcher` already filters to `MOBILE_MODES` (Dashboard + Pilot only), but if a user navigates to Engineer on desktop then resizes, or if the store has `engineer` as `currentMode` on mount, the Engineer panel will still render.

### Target behavior

- On mobile, Engineer mode is never rendered or accessible
- If `currentMode === 'engineer'` and `isMobile === true`, fall back to rendering `<DashboardMode />`
- `ModeSwitcher` already excludes Engineer on mobile — this is a defense-in-depth guard in `DashboardView`

### Implementation notes

In `DashboardView.tsx`, change the mode render logic:

```tsx
const activeMode =
  isMobile && currentMode === 'engineer' ? 'dashboard' : currentMode;
```

Then render based on `activeMode`.

### Data-testid requirements

```
data-testid="dashboard-mode"   — existing, no change needed
```

---

## Fix 3: Compact Mobile Controls Layout

### Current state

`ControlWidget` renders at full desktop size inside `PilotMobileLayout`. At 375px, the E-stop button, d-pad, and two velocity sliders stack and overflow.

### Target behavior

The controls card (carousel card 1) at 375px should fit within the viewport height without scrolling:

```
┌──────────────────────────┐
│  [E-STOP]                │  — full-width red button, 48px tall
├──────────────────────────┤
│         ↑                │
│      ←  ●  →             │  — d-pad centered, 44px touch targets
│         ↓                │
├──────────────────────────┤
│ Lin: ──●────────  0.0    │  — slider row, 44px touch height
│ Ang: ────●──────  0.0    │
└──────────────────────────┘
```

- E-stop: full-width, `min-h-[48px]`, `text-sm font-bold`, red (`bg-destructive`)
- D-pad: center-aligned, each directional button `min-w-[44px] min-h-[44px]` (WCAG touch target)
- Velocity sliders: full-width, stacked, `min-h-[44px]`
- No horizontal scrolling — everything fits within 375px
- `ControlWidget` should accept an `isMobile?: boolean` prop and render a compact layout when true

### Implementation notes

- Add `isMobile` prop to `ControlWidget` and its `.types.ts`
- Mobile layout uses a single column with the three zones stacked
- Desktop layout unchanged
- Pass `isMobile` through from `PilotMobileLayout` → `ControlWidget`

### Data-testid requirements (existing, must remain working)

```
data-testid="e-stop-button"
data-testid="dpad-up" / "dpad-down" / "dpad-left" / "dpad-right"
data-testid="linear-velocity-slider"
data-testid="angular-velocity-slider"
```

---

## Fix 4: Fill Vertical Dead Space

### Current state

After the instrument strip and before the bottom bar, there is dead space when the content (IMU/DataPlot tabs) does not fill the remaining height.

### Target behavior

- The carousel (Fix 1) uses `flex-1 min-h-0` so it always stretches to fill available height
- Each `CarouselItem` uses `h-full` so cards always fill the carousel height
- Content within each card uses `h-full overflow-y-auto` to scroll internally if needed
- Net result: no dead space — the carousel fills edge-to-edge between the instrument strip and the bottom bar

### Implementation notes

This is resolved structurally by Fix 1's layout. The outer `PilotMobileLayout` container should be:

```tsx
<div className="flex h-full flex-col overflow-hidden">
  {/* video strip — shrink-0 */}
  {/* instrument strip — shrink-0 */}
  {/* carousel — flex-1 min-h-0 */}
</div>
```

---

## Fix 5: Mode Switcher Hidden on Mobile

### Current state

`DashboardView.tsx` always renders `<ModeSwitcher />` in the header. On mobile this takes `~40px` of header height and offers buttons redundant with the bottom tab bar.

### Target behavior

- On mobile, the `<ModeSwitcher />` header bar is hidden entirely
- Navigation is handled by the bottom tab bar (already implemented)
- The header strip still exists but contains only connection status / robot selector (future phase)
- For now: hide the entire `shrink-0` header div on mobile

### Implementation notes

In `DashboardView.tsx`, conditionally render the header based on `isMobile`:

```tsx
{
  !isMobile && (
    <div className="flex shrink-0 items-center border-b border-slate-700 bg-slate-900 px-3 py-2">
      <ModeSwitcher />
    </div>
  );
}
```

### Data-testid requirements

```
data-testid="mode-switcher-header"   — add to the header div for test targeting
```

---

## Breakpoints & Invariants

| Breakpoint                        | Behavior                                                                    |
| --------------------------------- | --------------------------------------------------------------------------- |
| `< 768px` (`isMobile === true`)   | Carousel layout, Engineer hidden, compact controls, no mode switcher header |
| `>= 768px` (`isMobile === false`) | Desktop grid, all 3 modes, full controls, mode switcher header visible      |

The `useMobile()` hook at `src/shared/hooks/use-mobile.ts` already implements `< 768px` breakpoint. No changes needed to the hook.

---

## Files to Touch

| File                                                                 | Change                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/features/dashboard/DashboardView.tsx`                           | Fix 2 (engineer guard) + Fix 5 (hide header on mobile) |
| `src/features/dashboard/modes/PilotMode/PilotMode.tsx`               | Fix 1 (carousel) + Fix 4 (flex layout)                 |
| `src/features/pilot/components/ControlWidget/ControlWidget.tsx`      | Fix 3 (compact mobile layout)                          |
| `src/features/pilot/components/ControlWidget/ControlWidget.types.ts` | Fix 3 (add `isMobile` prop)                            |

---

## Test Strategy

### Unit tests (Vitest + RTL)

Each fix has targeted unit tests. Tests must be written before implementation (TDD).

**Fix 1 — Carousel:**

- `pilot-mobile-carousel` renders when `isMobile=true`
- Dot indicators render with correct count
- `pilot-swipeable-cards` (old div) is NOT rendered when carousel is active

**Fix 2 — Engineer hidden:**

- When `isMobile=true` and `currentMode='engineer'`, `DashboardMode` renders (not `EngineerMode`)
- `EngineerMode` is never rendered when `isMobile=true`

**Fix 3 — Compact controls:**

- When `isMobile=true`, E-stop, d-pad, and sliders all render within a single-column layout
- Touch targets are `>= 44px` (assert min dimensions via className check)

**Fix 5 — Header hidden:**

- When `isMobile=true`, `mode-switcher-header` is not in the DOM
- When `isMobile=false`, `mode-switcher-header` is in the DOM

### E2E / Visual (Playwright at 375×812)

- Navigate to Pilot mode on mobile viewport
- Assert carousel is present and first card visible
- Swipe/scroll to second card — assert controls card visible
- Assert no horizontal overflow on controls card
- Assert no dead space — carousel fills available height
- Navigate to Engineer mode (simulate store set) — assert falls back to Dashboard
- Assert mode switcher header not visible at 375px

---

## Acceptance Criteria

- [ ] Panels in Pilot mobile view are a swipeable carousel with dot indicators
- [ ] Engineer mode is never shown on mobile (guard in DashboardView)
- [ ] Controls fit within 375px width without scrolling, all touch targets >= 44px
- [ ] No dead space below content — carousel fills flex-1 height
- [ ] Mode switcher header hidden on mobile
- [ ] All existing tests continue to pass (no regressions)
- [ ] Quality gate passes: lint clean, no TS errors, all tests green
