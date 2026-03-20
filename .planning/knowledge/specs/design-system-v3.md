# Design System v3 Specification

## Design Intelligence Sources

UI/UX Pro Max search results informed all design decisions:

1. **Space Tech / Aerospace** — Holographic / HUD + Dark Mode, deep space black + star white + metallic
2. **Financial Dashboard** — Dark bg + red/green alerts + trust blue, data-dense layout
3. **IoT Dashboard** — Dark + status indicator colors, real-time monitoring patterns

## Color Palette (OKLCH)

### Philosophy

Dark-first industrial monitoring aesthetic. The background uses a deep navy-black with a subtle blue hue shift (265 hue) rather than pure neutral black, creating depth without sacrificing contrast. Accent colors use high-chroma OKLCH values for maximum readability against dark backgrounds.

### Dark Mode (Primary)

| Token                | OKLCH                        | Purpose                      |
| -------------------- | ---------------------------- | ---------------------------- |
| `--background`       | `oklch(0.13 0.028 265)`      | Deep navy-black, near-OLED   |
| `--foreground`       | `oklch(0.965 0.005 265)`     | Cool white text              |
| `--card`             | `oklch(0.18 0.032 265)`      | Elevated surface             |
| `--primary`          | `oklch(0.588 0.218 264.376)` | Trust blue — primary actions |
| `--secondary`        | `oklch(0.24 0.032 265)`      | Subtle surface distinction   |
| `--muted`            | `oklch(0.24 0.032 265)`      | De-emphasized areas          |
| `--muted-foreground` | `oklch(0.65 0.02 265)`       | Secondary text               |
| `--border`           | `oklch(0.32 0.035 265)`      | Subtle panel edges           |
| `--destructive`      | `oklch(0.704 0.191 22.216)`  | Error / danger red           |
| `--ring`             | `oklch(0.488 0.243 264.376)` | Focus rings — trust blue     |

### Status Colors

| Token                   | OKLCH                        | State                     |
| ----------------------- | ---------------------------- | ------------------------- |
| `--status-connected`    | `oklch(0.723 0.219 149.579)` | Green — active connection |
| `--status-connecting`   | `oklch(0.852 0.199 91.936)`  | Yellow — pending          |
| `--status-disconnected` | `oklch(0.556 0.015 265)`     | Gray — inactive           |
| `--status-error`        | `oklch(0.704 0.191 22.216)`  | Red — fault               |

### Telemetry Accent

| Token                    | OKLCH                        | Purpose                                  |
| ------------------------ | ---------------------------- | ---------------------------------------- |
| `--telemetry`            | `oklch(0.588 0.218 264.376)` | Trust blue for data visualization accent |
| `--telemetry-foreground` | `oklch(0.985 0 0)`           | Text on telemetry blue                   |

### Chart Palette

5-color sequential palette with distinct hues for overlapping data series:

1. Blue (264) — primary data
2. Green (149) — secondary / positive
3. Yellow (91) — tertiary / caution
4. Orange (55) — quaternary / warm
5. Red (22) — quinary / alert

## Typography

| Role                    | Font                | Rationale                                                              |
| ----------------------- | ------------------- | ---------------------------------------------------------------------- |
| UI text / headings      | Geist Variable      | Professional, clean geometric sans. Pairs well with technical content. |
| Data / telemetry values | Geist Mono Variable | Monospace for tabular alignment. Same family ensures visual harmony.   |

Both fonts are variable-weight, loaded via `@fontsource-variable`.

## Spacing

| Token               | Value            | Use                      |
| ------------------- | ---------------- | ------------------------ |
| `--spacing-panel`   | `0.75rem` (12px) | Internal panel padding   |
| `--spacing-section` | `1.5rem` (24px)  | Between related sections |
| `--spacing-layout`  | `2rem` (32px)    | Major layout gaps        |

## Border Radius

Base `--radius: 0.5rem` with computed variants from `sm` (0.3rem) to `4xl` (1.3rem). Slightly tighter than default shadcn for an industrial/HUD feel.

## Custom Components

| Component       | File                                        | Purpose                                   |
| --------------- | ------------------------------------------- | ----------------------------------------- |
| Show            | `src/shared/components/Show.tsx`            | Conditional rendering helper              |
| StatusIndicator | `src/shared/components/StatusIndicator.tsx` | Connection state dot + label              |
| DataCard        | `src/shared/components/DataCard.tsx`        | Panel wrapper with title, status, actions |
| LoadingSpinner  | `src/shared/components/LoadingSpinner.tsx`  | Accessible loading indicator (sm/md/lg)   |

All components have co-located `.types.ts` files and test coverage.
