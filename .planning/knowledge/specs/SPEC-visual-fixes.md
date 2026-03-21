# SPEC: Visual Fixes — Dark Theme Activation & UI Polish

**Status:** Ready for implementation
**Priority:** Critical (ISS-002) → High (ISS-003, ISS-006) → Medium (ISS-004) → Low (ISS-005)

---

## Context

The design system tokens are fully defined in `src/style.css` under the `.dark {}` block, but the app renders in light mode because `class="dark"` is never applied to `<html>`. All other issues are downstream of this, or are independent polish tasks on components that use hardcoded `slate-*` classes instead of the design token classes.

---

## ISS-002 (CRITICAL): Activate dark theme

**File:** `index.html:2`

**Problem:** `<html lang="en">` — no `class="dark"`. Tailwind's `@custom-variant dark (&:is(.dark *))` in `style.css` requires `.dark` on an ancestor element. Without it, all `.dark { }` token overrides are ignored and the app falls back to the `:root` light-mode values.

**Fix:**

```html
<html lang="en" class="dark"></html>
```

**Verification:** `document.documentElement.classList.contains('dark')` === `true`. Background color of `<body>` should be `oklch(0.13 0.028 265)` (deep navy-black), not white.

---

## ISS-003 (HIGH): Sidebar dark styling

**File:** `src/shared/components/DashboardShell.tsx:25-41`

**Problem:** The `<aside>` uses `bg-card` and `border-border` which resolve correctly once dark mode is active (ISS-002 fix). However, the sidebar currently lacks a bottom border on its header section and any visual weight to separate it from the main content area.

**Current classes on aside:**

```
border-r border-border bg-card
```

**Fix:** After ISS-002 is applied, audit sidebar rendering. If `bg-card` and `border-border` still look flat, add a subtle `shadow-[inset_-1px_0_0_0_var(--border)]` to reinforce the edge. The "Connections" label and placeholder text already use `text-muted-foreground` which will render correctly in dark mode.

**Note:** This issue may be fully resolved by ISS-002. Implement ISS-002 first, then confirm whether additional sidebar styling is needed.

---

## ISS-004 (MEDIUM): Panel card visual hierarchy

**File:** `src/features/dashboard/components/PanelFrame/PanelFrame.tsx:61-91`

**Problem:** `PanelFrame` uses hardcoded `slate-*` Tailwind classes instead of design token classes. These do not respond to the `.dark` class correctly and bypass the OKLCH token system entirely. Additionally, sovereign panels (video) are not visually distinguished from secondary panels.

**Current hardcoded classes:**

- Container: `border-slate-700 bg-slate-900`
- Header: `border-slate-700 bg-slate-800`
- Header text: `text-slate-300`
- Icons/buttons: `text-slate-500`, `hover:bg-slate-700`, `hover:text-slate-200`
- Context menu: `border-slate-600 bg-slate-800`
- Context menu items: `text-slate-300`, `hover:bg-slate-700`

**Fix — replace hardcoded slate classes with design token equivalents:**

| Current                | Replacement             |
| ---------------------- | ----------------------- |
| `bg-slate-900`         | `bg-card`               |
| `bg-slate-800`         | `bg-muted`              |
| `border-slate-700`     | `border-border`         |
| `border-slate-600`     | `border-border`         |
| `text-slate-300`       | `text-card-foreground`  |
| `text-slate-400`       | `text-muted-foreground` |
| `text-slate-500`       | `text-muted-foreground` |
| `hover:bg-slate-700`   | `hover:bg-secondary`    |
| `hover:text-slate-200` | `hover:text-foreground` |

**Sovereign panel differentiation:** When `isSovereign === true`, apply a primary-hued left border accent to the container:

```
border-l-2 border-l-primary
```

This distinguishes the video panel visually without adding heavyweight treatment.

---

## ISS-005 (LOW): Mode switcher tactical styling

**File:** `src/features/dashboard/components/ModeSwitcher/ModeSwitcher.tsx:31-38`

**Problem:** Buttons use `bg-blue-600` (hardcoded Tailwind blue) for active state and `hover:bg-slate-700` for inactive — both bypass the design token system. Font is inherited sans-serif, not monospace. Does not match the HUD/defense aesthetic.

**Fix — active button:**

```
bg-primary text-primary-foreground font-mono tracking-widest uppercase text-[10px]
```

**Fix — inactive button:**

```
text-muted-foreground hover:bg-secondary hover:text-foreground font-mono tracking-widest uppercase text-[10px]
```

The `tracking-widest` + `font-mono` + `text-[10px]` combination creates the tactical HUD feel specified by the design system. Remove `font-semibold` (conflicts with mono spacing).

---

## ISS-006 (HIGH): Pilot mode controls cut off

**File:** `src/features/dashboard/modes/PilotMode/PilotMode.tsx:168-211`

**Problem:** `ResponsiveGrid` with `rowHeight={80}` and the default pilot layout positions video (`h: 5`) and robot-controls (`h: 3`) such that total height = (5+3) \* 80 + margins ≈ 672px+ which exceeds typical viewport height of 600-700px after header. Controls panel is clipped below the fold.

**Root cause:** `rowHeight={80}` is too tall for a dashboard viewport. The grid does not constrain itself to the available viewport height — it grows the page instead.

**Fix options (pick one):**

**Option A — Reduce rowHeight:** Change `rowHeight={80}` to `rowHeight={60}`. Total grid height drops proportionally. Video panel at h:5 = 300px, controls at h:3 = 180px. Both visible in a 600px viewport.

**Option B — Constrain the grid container to viewport:** Wrap `ResponsiveGrid` in a `div` with `h-[calc(100vh-theme(spacing.14))]` (subtracting header height) and `overflow-auto`. This keeps all panels scrollable but video+controls always visible initially if they fit.

**Recommendation:** Option A. Simpler, no scrollbar flash, matches the intended compact dashboard feel.

**Also fix in PilotMode.tsx:214:** The "Add panel" bar uses hardcoded `border-slate-700`, `border-slate-600`, `text-slate-300`, `hover:bg-slate-700` — replace with design token equivalents (`border-border`, `text-muted-foreground`, `hover:bg-secondary`) consistent with ISS-004.

---

## Also: PilotMode mobile hardcoded slate classes

**File:** `src/features/dashboard/modes/PilotMode/PilotMode.tsx:63-99`

The `PilotMobileLayout` uses `border-slate-700 bg-slate-900 text-slate-400 text-blue-300` throughout. These should be replaced with design tokens as part of ISS-004 scope — same substitution table applies.

---

## Implementation order

1. **ISS-002** — `index.html` one-liner. Unlocks all other dark-mode fixes.
2. **ISS-003** — Verify sidebar after ISS-002. Likely no-op; add shadow only if still flat.
3. **ISS-004** — `PanelFrame.tsx` slate → token class replacement + sovereign accent.
4. **ISS-006** — `PilotMode.tsx` rowHeight reduction + add-panel bar token cleanup.
5. **ISS-005** — `ModeSwitcher.tsx` tactical mono styling.

---

## Test targets (for E2E visual tests)

| Test                   | Assertion                                                                      |
| ---------------------- | ------------------------------------------------------------------------------ |
| Dark background active | `html.classList.contains('dark')` === true                                     |
| Body background        | Computed `background-color` ≠ white/`rgb(255,255,255)`                         |
| Sidebar dark           | `aside` computed background is dark (not white)                                |
| Robot controls visible | `[data-testid="panel-robot-controls"]` is in viewport (no clipping)            |
| Video panel visible    | `[data-testid="panel-video"]` is in viewport                                   |
| Mode switcher font     | Active mode button uses monospace font                                         |
| Sovereign panel accent | `[data-testid="panel-video"]` container has left border matching primary color |
