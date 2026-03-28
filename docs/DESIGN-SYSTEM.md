# Design System — Midnight Operations

> Reference document for the Robot Telemetry Dashboard visual identity.
> All tokens live in `src/index.css` via Tailwind v4's `@theme` directive.

## Identity

**Name:** Midnight Operations
**Aesthetic:** Industrial precision — engineered, not designed. Submarine control room meets modern C2 platform.
**Palette:** OKLCH hue 260 (deep blue-shifted surfaces), accent hue 230 (bright blue)
**Fonts:** Exo (UI) + Roboto Mono (telemetry data)
**Icons:** Lucide React (`lucide-react`) — shadcn default, tree-shakeable SVG icons
**Mood:** Authority, precision, live operations

## Tailwind v4 Token Architecture

Colors support dark/light theming via CSS variables + `@theme inline`:

```css
/* 1. @theme inline registers token NAMES with Tailwind → generates utilities */
@theme inline {
  --color-surface-base: var(--color-surface-base);
}

/* 2. :root and [data-theme] set the actual VALUES */
:root {
  --color-surface-base: oklch(0.09 0.02 260);
} /* dark */
[data-theme='light'] {
  --color-surface-base: oklch(0.95 0.005 260);
} /* light */
```

This gives us `bg-surface-base` as a Tailwind utility that automatically switches with the theme.

**Never put colors directly in `@theme`** — they won't respond to theme changes. Always use the `@theme inline` → `:root` pattern.

## Color Tokens

### Surfaces — 4-tier depth hierarchy

| Token                       | Dark Mode              | Light Mode              | Usage                     |
| --------------------------- | ---------------------- | ----------------------- | ------------------------- |
| `--color-surface-base`      | `oklch(0.09 0.02 260)` | `oklch(0.95 0.005 260)` | Page background           |
| `--color-surface-primary`   | `oklch(0.12 0.02 260)` | `oklch(0.92 0.008 260)` | Panels, cards, modals     |
| `--color-surface-secondary` | `oklch(0.16 0.02 260)` | `oklch(0.88 0.01 260)`  | Sidebar, hover states     |
| `--color-surface-tertiary`  | `oklch(0.20 0.02 260)` | `oklch(0.84 0.01 260)`  | Inputs, nested containers |

### Accent

| Token                   | Dark Mode              | Light Mode             | Usage                              |
| ----------------------- | ---------------------- | ---------------------- | ---------------------------------- |
| `--color-accent`        | `oklch(0.70 0.20 230)` | `oklch(0.50 0.22 230)` | CTAs, active nav, data highlights  |
| `--color-accent-glow`   | `0.30 alpha`           | `0.20 alpha`           | Button hover glow, focus rings     |
| `--color-accent-subtle` | `0.08 alpha`           | `0.06 alpha`           | Hover backgrounds, selected states |

### Status — Triple-Redundant (color + icon + text label)

| Status   | Token                     | Dark Hue               | Icon | Label    |
| -------- | ------------------------- | ---------------------- | ---- | -------- |
| Nominal  | `--color-status-nominal`  | `oklch(0.70 0.19 155)` | ✓    | NOMINAL  |
| Caution  | `--color-status-caution`  | `oklch(0.75 0.18 65)`  | !    | CAUTION  |
| Critical | `--color-status-critical` | `oklch(0.60 0.24 25)`  | ✕    | CRITICAL |
| Offline  | `--color-status-offline`  | `oklch(0.45 0.02 260)` | —    | OFFLINE  |

Each status has a `*-bg` variant at 0.10 alpha for badge backgrounds.

### Text

| Token                    | Dark Mode              | Light Mode             | Usage                         |
| ------------------------ | ---------------------- | ---------------------- | ----------------------------- |
| `--color-text-primary`   | `oklch(0.93 0.01 260)` | `oklch(0.18 0.02 260)` | Main content, headings        |
| `--color-text-secondary` | `oklch(0.65 0.02 260)` | `oklch(0.40 0.02 260)` | Labels, panel titles          |
| `--color-text-muted`     | `oklch(0.45 0.02 260)` | `oklch(0.58 0.02 260)` | Hints, placeholders, disabled |

### Borders & Effects

| Token                  | Dark Mode              | Light Mode             | Usage                       |
| ---------------------- | ---------------------- | ---------------------- | --------------------------- |
| `--color-border`       | `oklch(0.25 0.02 260)` | `oklch(0.82 0.01 260)` | Panel borders, dividers     |
| `--color-border-hover` | accent value           | accent value           | Interactive hover borders   |
| `--color-surface-glow` | accent at 0.04         | accent at 0.04         | `inset 0 1px 0 0` on panels |
| `--color-hud-overlay`  | base at 0.75           | dark at 0.70           | Modal/overlay backdrop      |

## Typography

### Scale (4 sizes only)

| Size    | Px   | Tailwind   | Usage                         |
| ------- | ---- | ---------- | ----------------------------- |
| Display | 36px | `text-4xl` | Landing hero headline         |
| Heading | 20px | `text-xl`  | Section titles, page headings |
| Body    | 14px | `text-sm`  | Default text, descriptions    |
| Label   | 12px | `text-xs`  | Captions, badges, data labels |

### Fonts

| Role           | Font        | Tailwind    | Weight                           |
| -------------- | ----------- | ----------- | -------------------------------- |
| UI text        | Exo         | `font-sans` | 400 (body), 600 (headings)       |
| Telemetry data | Roboto Mono | `font-mono` | 400 (values), 600 (panel titles) |

**Rules:**

- Only 2 weights: 400 and 600. No 300, 500, 700.
- Telemetry values (IMU, velocities, coordinates, topic names) always use `font-mono`.
- Never hardcode font-family strings.

## Spacing

Base unit: `--spacing: 4px` (Tailwind v4 multiplier).

| Tailwind       | Value | Usage                              |
| -------------- | ----- | ---------------------------------- |
| `p-1`, `gap-1` | 4px   | Icon gaps, tight spacing           |
| `p-2`, `gap-2` | 8px   | Compact spacing, mobile padding    |
| `p-3`, `gap-3` | 12px  | Grid gaps, card padding            |
| `p-4`, `gap-4` | 16px  | Default spacing, section gaps      |
| `p-6`, `gap-6` | 24px  | Section padding, larger margins    |
| `p-8`, `gap-8` | 32px  | Major section breaks, hero padding |

## Panel Contract

Every panel/card/widget in the application:

```css
background: var(--color-surface-primary);
border: 1px solid var(--color-border);
box-shadow: inset 0 1px 0 0 var(--color-surface-glow);
border-radius: 2px;
```

**Tailwind equivalent:**

```html
<div
  class="bg-surface-primary border border-border rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)]"
></div>
```

**Panel visual details:**

- Registration tick marks on corners (accent-colored 8px border fragments, 0.3 opacity)
- No gradients, no drop shadows (only inset glow)
- No border-radius larger than 4px

## Interactive States

| State    | Treatment                                                                                |
| -------- | ---------------------------------------------------------------------------------------- |
| Hover    | `border-color: var(--color-border-hover)`, `box-shadow` glow, `translateY(-1px or -2px)` |
| Focus    | `outline: 2px solid var(--color-accent)`, `outline-offset: 2px`                          |
| Active   | Accent-subtle background fill                                                            |
| Disabled | `opacity: 0.5`, `cursor: not-allowed`                                                    |

**Timing:** All transitions 150-300ms ease. Use `transition-all duration-200` as default.

## Animations

| Animation   | Usage                                 | Duration                |
| ----------- | ------------------------------------- | ----------------------- |
| `fade-up`   | Section entrance, staggered per child | 0.5s ease-out           |
| `breathe`   | Nominal status dot pulsing            | 3s ease-in-out infinite |
| `scan-beam` | Background scan sweep (landing page)  | 8-12s linear infinite   |

All animations respect `prefers-reduced-motion` via `motion-safe:` prefix.

## Atmospheric Effects

| Effect             | Implementation                                            | Where                              |
| ------------------ | --------------------------------------------------------- | ---------------------------------- |
| Diagonal scanlines | `repeating-linear-gradient(-45deg, ...)` at 0.025 opacity | Page background                    |
| Scan beam          | Translucent accent gradient, animated vertically          | Landing page, optionally workspace |
| Data glow          | `text-shadow: 0 0 8px accent/0.25`                        | Telemetry values (dark mode only)  |
| Surface glow       | `inset 0 1px 0 0 accent/0.04`                             | All panels                         |

## Button Hierarchy

| Variant   | Background        | Border   | Text             | Usage                                  |
| --------- | ----------------- | -------- | ---------------- | -------------------------------------- |
| Primary   | `accent`          | none     | `surface-base`   | Main CTA (Launch Dashboard, Add Robot) |
| Secondary | transparent       | `accent` | `accent`         | Alternative CTA (Try Demo)             |
| Danger    | `status-critical` | none     | white            | E-STOP, destructive actions            |
| Ghost     | transparent       | `border` | `text-secondary` | Low-priority actions (Settings)        |

## Empty States

Every empty state must include:

1. **Icon** — contextual placeholder (grid pattern, radar rings, etc.) at 0.3 opacity
2. **Title** — 20px Exo 600, `text-primary`
3. **Body** — 12px Roboto Mono, `text-muted`, max-width 340px, instructional
4. **Action** — Secondary button with clear verb+noun CTA

## Responsive Breakpoints

| Name    | Width      | Layout                                                  |
| ------- | ---------- | ------------------------------------------------------- |
| Desktop | >= 1024px  | Sidebar + 4-col fleet + 2×3 workspace                   |
| Tablet  | 768-1023px | Sidebar + 2-col fleet + 2-col workspace                 |
| Mobile  | <= 767px   | Bottom tab bar + scroll-snap fleet + carousel workspace |

## Light Theme Notes

The light theme is "muted professional" — cool grays, not stark white.

- Surface base starts at `oklch(0.95)`, not 1.0
- Accent deepens to `oklch(0.50)` for sufficient contrast
- Text-shadow glow is disabled (set to `none`)
- Scanline opacity reduced from 0.025 to 0.015
- All status colors shift darker for readability on light surfaces
