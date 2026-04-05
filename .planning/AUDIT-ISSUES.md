# Design System Compliance Audit

**Date:** 2026-03-31
**Branch:** EPIC/v4-rebuild
**Source of Truth:** `src/index.css` (Midnight Operations design system tokens)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| HIGH     | 11    |
| MEDIUM   | 13    |
| LOW      | 3     |
| **Total**| **27**|

Overall the codebase is in good shape — most components use design system Tailwind utilities correctly. The issues cluster around **canvas fallback colors** that have drifted from current token values, **hardcoded `rgba()` values** in canvas refs, and a **`text-white` hardcode** in the fleet feature. The landing page is notably clean.

---

## Cross-Cutting Patterns

### 1. Canvas fallback color drift (MEDIUM, 8 occurrences)
Every canvas component initializes a `colorsRef` with hardcoded OKLCH/rgba fallback values. While these are overwritten by `getComputedStyle()` at runtime, the fallbacks have drifted from current token values in several components. If `getComputedStyle()` fails or returns empty (e.g., SSR, testing), the wrong colors render.

**Affected components:**
- `TelemetryPanel` — `border` fallback is `oklch(0.30 0.02 260)`, token is `oklch(0.38 0.02 260)`
- `TelemetryPanel` — `textSecondary` fallback is `oklch(0.65 0.02 260)`, token is `oklch(0.72 0.02 260)`
- `LidarPanel` — `border` fallback is `rgba(255,255,255,0.15)`, should be OKLCH token value
- `AttitudeIndicator` — `border` fallback is `rgba(255,255,255,0.15)`, should be OKLCH token value
- `CompassHeading` — `border` fallback is `rgba(255,255,255,0.15)`, should be OKLCH token value
- `WireframeView` — `border` fallback is `rgba(255,255,255,0.15)`, should be OKLCH token value
- `PilotCompass` — `tickMinor` fallback is `rgba(255,255,255,0.15)`, `tickMajor` fallback is `rgba(255,255,255,0.35)`
- `PilotLidarMinimap` — `gridLine` fallback is `rgba(255,255,255,0.08)`

### 2. Duplicated robot color maps (LOW, 1 occurrence)
`RobotCard/constants.ts` has three nearly identical maps (`ROBOT_COLOR_BORDER`, `ROBOT_COLOR_BG`, `ROBOT_COLOR_TEXT`) that differ only by Tailwind prefix. A single base map with a utility function could eliminate this duplication.

### 3. `eslint-disable` comments in canvas components (informational)
Six canvas components have `eslint-disable-next-line react-hooks/exhaustive-deps` for `themeVersion`. This is a known pattern documented in the codebase and not a compliance issue, but noted for completeness.

---

## Per-Feature Issue Lists

### Fleet (`src/features/fleet/`)

```
FILE: src/features/fleet/components/RobotCard/components/RobotDeleteButton.tsx
LINE: 58
ISSUE: Hardcoded `text-white` instead of design system token
CURRENT: className="bg-status-critical text-white hover:bg-status-critical/75 ..."
SHOULD BE: `text-text-primary` or `text-destructive-foreground` (shadcn token)
SEVERITY: HIGH
```

```
FILE: src/features/fleet/components/RobotCard/constants.ts
LINE: 38-66
ISSUE: Three separate color maps (ROBOT_COLOR_BORDER, ROBOT_COLOR_BG, ROBOT_COLOR_TEXT)
       duplicate the same 12-color list with different prefixes
CURRENT: Three Record<RobotColor, string> maps with border-l-*, bg-*, text-* prefixes
SHOULD BE: Single base map + utility function, e.g.
           `getRobotColorClass(color, prefix)` or a single map returning all three
SEVERITY: LOW
```

```
FILE: src/features/fleet/components/RobotCard/components/RobotCardDataRow.tsx
LINE: 16
ISSUE: dt label uses `text-text-muted` — these are data labels (URL, Last Seen, etc.)
       that should be readable, not decorative
CURRENT: className="font-sans text-xs text-text-muted"
SHOULD BE: Consider `text-text-secondary` for better readability on data labels
SEVERITY: LOW
```

### Workspace (`src/features/workspace/`)

```
FILE: src/features/workspace/components/TelemetryPanel.tsx
LINE: 29
ISSUE: Canvas fallback `textSecondary` value drifted from token
CURRENT: textSecondary: 'oklch(0.65 0.02 260)'
SHOULD BE: 'oklch(0.72 0.02 260)' (matches --color-text-secondary in :root)
SEVERITY: MEDIUM
```

```
FILE: src/features/workspace/components/TelemetryPanel.tsx
LINE: 32
ISSUE: Canvas fallback `border` value drifted from token
CURRENT: border: 'oklch(0.30 0.02 260)'
SHOULD BE: 'oklch(0.38 0.02 260)' (matches --color-border in :root)
SEVERITY: MEDIUM
```

```
FILE: src/features/workspace/components/TelemetryPanel.tsx
LINE: 88
ISSUE: Grid lines use `textMuted` color instead of `border` token for grid
CURRENT: ctx.strokeStyle = c.textMuted (grid lines)
SHOULD BE: Grid lines should use `c.border` for consistency with other canvas panels
SEVERITY: MEDIUM
```

```
FILE: src/features/workspace/components/LidarPanel.tsx
LINE: 33
ISSUE: Canvas fallback `border` is `rgba(255,255,255,0.15)` — not an OKLCH token value
CURRENT: border: 'rgba(255,255,255,0.15)'
SHOULD BE: 'oklch(0.38 0.02 260)' (matches --color-border dark token)
SEVERITY: HIGH
```

```
FILE: src/features/workspace/components/LidarPanel.tsx
LINE: 35
ISSUE: Canvas fallback `textSecondary` drifted from token
CURRENT: textSecondary: 'oklch(0.65 0.02 260)'
SHOULD BE: 'oklch(0.72 0.02 260)' (matches --color-text-secondary in :root)
SEVERITY: MEDIUM
```

```
FILE: src/features/workspace/components/ImuPanel/components/AttitudeIndicator.tsx
LINE: 18
ISSUE: Canvas fallback `border` is `rgba(255,255,255,0.15)` — not an OKLCH token value
CURRENT: border: 'rgba(255,255,255,0.15)'
SHOULD BE: 'oklch(0.38 0.02 260)' (matches --color-border dark token)
SEVERITY: HIGH
```

```
FILE: src/features/workspace/components/ImuPanel/components/AttitudeIndicator.tsx
LINE: 23
ISSUE: Canvas fallback `textSecondaryAlpha` source value drifted from token
CURRENT: Base value 'oklch(0.65 0.02 260)' passed to withAlpha()
SHOULD BE: 'oklch(0.72 0.02 260)' (matches --color-text-secondary in :root)
SEVERITY: MEDIUM
```

```
FILE: src/features/workspace/components/ImuPanel/components/CompassHeading.tsx
LINE: 17
ISSUE: Canvas fallback `border` is `rgba(255,255,255,0.15)` — not an OKLCH token value
CURRENT: border: 'rgba(255,255,255,0.15)'
SHOULD BE: 'oklch(0.38 0.02 260)' (matches --color-border dark token)
SEVERITY: HIGH
```

```
FILE: src/features/workspace/components/ImuPanel/components/WireframeView.tsx
LINE: 20
ISSUE: Canvas fallback `border` is `rgba(255,255,255,0.15)` — not an OKLCH token value
CURRENT: border: 'rgba(255,255,255,0.15)'
SHOULD BE: 'oklch(0.38 0.02 260)' (matches --color-border dark token)
SEVERITY: HIGH
```

### Pilot (`src/features/pilot/`)

```
FILE: src/features/pilot/components/PilotCompass.tsx
LINE: 28
ISSUE: Canvas fallback `tickMinor` is `rgba(255,255,255,0.15)` — hardcoded, not token-derived
CURRENT: tickMinor: 'rgba(255,255,255,0.15)'
SHOULD BE: 'oklch(0.38 0.02 260)' (resolved from --color-border)
SEVERITY: HIGH
```

```
FILE: src/features/pilot/components/PilotCompass.tsx
LINE: 29
ISSUE: Canvas fallback `tickMajor` is `rgba(255,255,255,0.35)` — hardcoded, not token-derived
CURRENT: tickMajor: 'rgba(255,255,255,0.35)'
SHOULD BE: 'oklch(0.72 0.02 260)' (resolved from --color-text-secondary)
SEVERITY: HIGH
```

```
FILE: src/features/pilot/components/PilotCompass.tsx
LINE: 92
ISSUE: Canvas uses 'Exo, sans-serif' font string without matching CSS var
CURRENT: ctx.font = '600 12px Exo, sans-serif'
SHOULD BE: ctx.font = '600 12px "Exo", ui-sans-serif, system-ui, sans-serif' (match --font-sans)
SEVERITY: MEDIUM
```

```
FILE: src/features/pilot/components/PilotLidarMinimap.tsx
LINE: 28
ISSUE: Canvas fallback `gridLine` is `rgba(255,255,255,0.08)` — hardcoded, not token-derived
CURRENT: gridLine: 'rgba(255,255,255,0.08)'
SHOULD BE: 'oklch(0.38 0.02 260)' (resolved from --color-border)
SEVERITY: HIGH
```

```
FILE: src/features/pilot/constants.ts
LINE: 52-53
ISSUE: HUD_PANEL_BASE uses `border-accent/20` and `border-t-accent/10` — arbitrary opacity
       modifiers on accent token, not a defined design system token
CURRENT: 'bg-surface-base/60 backdrop-blur-sm border border-accent/20 border-t-accent/10 rounded-sm ...'
SHOULD BE: Consider using `border-border` for consistency, or document the HUD-specific
           opacity pattern as a design system extension
SEVERITY: MEDIUM
```

```
FILE: src/features/pilot/components/PilotGyroReadout.tsx
LINE: 23
ISSUE: Divider uses `border-accent/10` instead of `border-border`
CURRENT: className="border-t border-accent/10 mt-1 pt-1"
SHOULD BE: `border-t border-border` for consistency with design system divider pattern
SEVERITY: MEDIUM
```

```
FILE: src/features/pilot/components/PilotStatusBar.tsx
LINE: 27, 38
ISSUE: Dividers use `border-accent/10` instead of `border-border`
CURRENT: className="border-t border-accent/10 pt-1.5 ..."
SHOULD BE: `border-t border-border` for consistency with design system divider pattern
SEVERITY: MEDIUM
```

```
FILE: src/features/pilot/components/PilotLidarMinimap.tsx
LINE: 147
ISSUE: Inline style `borderRadius: '50%'` used instead of Tailwind class
CURRENT: style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE, borderRadius: '50%' }}
SHOULD BE: className="rounded-full" (Tailwind utility)
SEVERITY: MEDIUM
```

### Landing (`src/features/landing/`)

```
FILE: src/features/landing/components/LandingHero.tsx
LINE: 38
ISSUE: Arbitrary shadow value uses CSS var() references inline in className
CURRENT: hover:shadow-[0_0_24px_var(--color-accent-glow),0_8px_16px_var(--color-shadow)]
SHOULD BE: Extract to a named shadow utility in @theme or a constants file.
           Not a token violation per se (it references tokens), but arbitrary value syntax
SEVERITY: LOW
```

```
FILE: src/features/landing/components/LandingHero.tsx
LINE: 56
ISSUE: Arbitrary shadow value with CSS vars inline in className
CURRENT: shadow-[0_0_40px_var(--color-accent-subtle),0_20px_60px_var(--color-shadow-heavy)]
SHOULD BE: Extract to a named shadow utility in @theme or a constants file
SEVERITY: MEDIUM
```

```
FILE: src/features/landing/components/LandingCTA.tsx
LINE: 27
ISSUE: Same arbitrary shadow pattern as LandingHero
CURRENT: hover:shadow-[0_0_24px_var(--color-accent-glow),0_8px_16px_var(--color-shadow)]
SHOULD BE: Extract to a named shadow utility — this pattern repeats across landing components
SEVERITY: MEDIUM
```

---

## Recommended Systemic Fixes

### 1. Create a canvas color defaults utility (fixes 8 issues)
Create a shared utility that provides correct fallback values matching current tokens:
```ts
// src/utils/canvasColors.ts
export const CANVAS_FALLBACKS = {
  border: 'oklch(0.38 0.02 260)',
  textPrimary: 'oklch(0.93 0.01 260)',
  textSecondary: 'oklch(0.72 0.02 260)',
  textMuted: 'oklch(0.57 0.02 260)',
  accent: 'oklch(0.7 0.2 230)',
  statusNominal: 'oklch(0.7 0.19 155)',
  statusCaution: 'oklch(0.75 0.18 65)',
  statusCritical: 'oklch(0.6 0.24 25)',
  imuSky: 'oklch(0.5 0.14 230)',
  imuGround: 'oklch(0.35 0.1 65)',
} as const;
```
All canvas components import from this single source instead of each maintaining their own fallbacks. When tokens change, one file update fixes all canvases.

### 2. Eliminate `rgba()` fallbacks in canvas refs (fixes 6 HIGH issues)
Replace every `rgba(255,255,255,0.15)` / `rgba(255,255,255,0.08)` / `rgba(255,255,255,0.35)` with the corresponding OKLCH token value from the utility above. The `rgba` values were likely carried over from pre-design-system code.

### 3. Replace `text-white` with design system token (fixes 1 HIGH issue)
The `AlertDialogAction` in `RobotDeleteButton.tsx` uses `text-white`. Replace with `text-text-primary` (dark theme) or `text-destructive-foreground` (shadcn semantic token).

### 4. Extract landing page shadow to @theme (fixes 3 issues)
The `hover:shadow-[0_0_24px_var(--color-accent-glow),...]` pattern repeats. Add to `@theme`:
```css
--shadow-glow-accent: 0 0 24px var(--color-accent-glow), 0 8px 16px var(--color-shadow);
--shadow-glow-accent-heavy: 0 0 40px var(--color-accent-subtle), 0 20px 60px var(--color-shadow-heavy);
```
Then use `shadow-glow-accent` / `shadow-glow-accent-heavy` Tailwind utilities.

### 5. Consolidate robot color maps (fixes 1 LOW issue)
Replace three maps with a single map returning an object:
```ts
export const ROBOT_COLORS: Record<RobotColor, { border: string; bg: string; text: string }> = {
  blue: { border: 'border-l-robot-blue', bg: 'bg-robot-blue', text: 'text-robot-blue' },
  // ...
};
```

### 6. Standardize HUD divider borders (fixes 3 MEDIUM issues)
Replace `border-accent/10` with `border-border` in PilotGyroReadout and PilotStatusBar dividers. If the HUD needs a distinct divider style, define a `HUD_DIVIDER_CLASS` constant in pilot constants.
