# Mockups — Feature Guide

## Overview

The Mockups page is an internal **design-system / component showcase** — a single scrollable reference page that renders every design token, component variant, and motion pattern the app uses in one place. Per project history it is the **source of truth for per-feature color/contrast/visibility audits**: every showcase block draws its colors and styles from the same Tailwind tokens production uses, so visually verifying this page (light vs dark, mobile vs desktop) catches token drift, contrast failures, and visibility regressions before they reach real features.

- **Route:** `/mockups`, rendered inside `AppShell` (sidebar / header / status bar) — wired in `src/App.tsx:45` as a lazy-loaded child of the `AppShell` route element.
- **Entry component:** `MockupsPage` (`src/features/mockups/MockupsPage.tsx`). Fully self-contained — no external Zustand stores, no ROS connection. All state is local.
- **Data sources:**
  - `useScrollSpy` (`hooks/useScrollSpy.ts`) — tracks which section is in view via `IntersectionObserver` and drives the active-nav highlight.
  - `useMockTelemetry` (`hooks/useMockTelemetry.ts`) — generates fake telemetry on `setInterval` to animate the live panel demos (consumed only by `PanelShowcase`).
  - Static data lives in `constants.ts` (token groups, typography samples, spacing steps, status states, button variants, icon set, border effects, animation list, mock LiDAR points, telemetry series colors). Types live in `types/MockupsPage.types.ts`.

## Flow map

`MockupsPage` renders a two-column layout (`flex h-full overflow-hidden`):

- **Left:** a sticky `<nav>` (`w-48`, `sticky top-0`) titled "Design System" listing one button per section, generated from `MOCK_SECTIONS`.
- **Right:** a scrollable `<main>` that maps `MOCK_SECTIONS` into `MockupSection` wrappers, injecting the matching component from the `SECTION_COMPONENTS` map keyed by section `id`.

Section order is fixed by `MOCK_SECTIONS` in `constants.ts`:

1. `colors` — Color Tokens → `ColorSwatches`
2. `typography` — Typography Scale → `TypographyScale`
3. `spacing` — Spacing Scale → `SpacingScale`
4. `status` — Status Indicators → `StatusIndicators`
5. `buttons` — Button Showcase → `ButtonShowcase`
6. `panels` — Panel Showcase → `PanelShowcase`
7. `icons` — Icon Grid → `IconGrid`
8. `borders` — Border Effects → `BorderEffects`
9. `empty` — Empty States → `EmptyStates`
10. `animations` — Animations → `AnimationShowcase`

**Scroll-spy nav behavior** (`useScrollSpy` + `MockupsPage`):

- `SECTION_IDS` (`MockupsPage.tsx:19`) is a stable array derived once from `MOCK_SECTIONS.map(s => s.id)` and passed to `useScrollSpy`.
- The hook observes each section element with `threshold: [0, 0.25, 0.5, 0.75, 1]` and `rootMargin: '-10% 0px -10% 0px'`, tracking each section's `intersectionRatio` in a `Map` and selecting the id with the highest ratio as `activeId`. It only updates when `maxRatio > 0`, so it never blanks out mid-scroll. Initial value is the first section id (`colors`).
- The active nav button gets `text-accent bg-accent-subtle font-semibold` and `aria-current="true"`; inactive buttons get muted text with hover styles.
- Clicking a nav button calls `scrollToSection(id)` (`MockupsPage.tsx:45`), which does `document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' })`.

## Segments

### Colors (`ColorSwatches`)

- **Responsibilities:** Renders every design-token color grouped by namespace from `COLOR_TOKEN_GROUPS` — `Surface`, `Text`, `Accent`, `Status`, `Border`, `Effects`, and `Robot Identity`. Each token shows a swatch box, the short token name (`--color-` prefix stripped), and the **resolved** computed value.
- **Available actions:** A theme toggle button (shadcn `Button`, `Sun`/`Moon` icons) flips a **local** `localTheme` (`'dark' | 'light'`) state. It applies `data-theme` on the wrapper `#color-swatches-root` div only — it does **not** touch the global theme.
- **State / data sources:** Local `localTheme` and `resolvedColors` state. `resolveColors` reads each token off `getComputedStyle(#color-swatches-root)` and runs on a 50ms `setTimeout` after `localTheme` changes (delay lets the `data-theme` attribute take effect before reading).
- **Notes:** Verify every swatch resolves to a real value (not `...` or transparent) in **both** themes. This is the primary contrast/token-drift audit surface — confirm Status and Robot Identity colors stay distinguishable in light mode, and that token namespaces match those documented in CLAUDE.md (`surface`, `text`, `accent`, `status`, `border` only).

### Typography (`TypographyScale`)

- **Responsibilities:** Renders the full permitted typographic matrix — the 4 sizes from `TYPOGRAPHY_SAMPLES` (36/20/14/12px → `text-4xl`/`text-xl`/`text-sm`/`text-xs`) across the 2 font families (`Exo` via `font-sans`, `Roboto Mono` via `font-mono`) and 2 weights (400 `font-normal`, 600 `font-semibold`). Sample string is "The quick brown fox" with a mono size label per row.
- **Available actions:** None (static display).
- **State / data sources:** `TYPOGRAPHY_SAMPLES` from `constants.ts`; `FONT_FAMILIES` and `FONT_WEIGHTS` are local module constants in the component.
- **Notes:** Verify only the four canonical sizes appear (12/14/20/36px) and only the two weights — no stray sizes/weights. Confirm Exo vs Roboto Mono render with distinct glyphs.

### Spacing (`SpacingScale`)

- **Responsibilities:** Renders a horizontal bar per `SPACING_SCALE` step (4, 8, 12, 16, 20, 24, 32, 48, 64px → `p-1`..`p-16`). Each row shows the px value, an accent-filled bar, and the Tailwind class.
- **Available actions:** None.
- **State / data sources:** `SPACING_SCALE` from `constants.ts`. Bar width is `step.px * 4` px (visual amplification, not the literal token width).
- **Notes:** Verify the bars use `bg-accent` and grow monotonically; confirm the 4px base-unit progression matches the design system.

### Status indicators (`StatusIndicators`)

- **Responsibilities:** Renders the four system states from `STATUS_STATES` (`Nominal`, `Caution`, `Critical`, `Offline`) as cards. Each card is **triple-redundant per MIL-STD-1472H**: a colored dot, an icon (`CheckCircle` / `AlertTriangle` / `XCircle` / `WifiOff`), and a text label — plus a "color + icon + label" caption. Background, text, and dot colors come from the status token classes (`bg-status-*-bg`, `text-status-*`, `bg-status-*`).
- **Available actions:** None.
- **State / data sources:** `STATUS_STATES` from `constants.ts`.
- **Notes:** Verify all three redundant channels render for each state and that status colors meet contrast against their `*-bg` background in both themes — color must never be the only signal.

### Buttons (`ButtonShowcase`)

- **Responsibilities:** Renders all shadcn `Button` variants from `BUTTON_VARIANTS` (`default`/Primary, `secondary`, `destructive`, `ghost`, `outline`) in two rows: **Default** and **Disabled**.
- **Available actions:** Buttons are real shadcn `Button`s and are clickable in the Default row (no onClick handler — hover/focus/active states are the demo). Disabled row buttons are `disabled`.
- **State / data sources:** `BUTTON_VARIANTS` from `constants.ts`; uses `@/components/ui/button`.
- **Notes:** Verify each variant is visually distinct, has `cursor-pointer` + `transition` and a visible focus ring, and that disabled variants are clearly de-emphasized.

### Panels (`PanelShowcase`)

- **Responsibilities:** Renders all six workspace panels in fixed-height (`h-96`) `PanelFrame` containers. Two panels are **simplified inline recreations** (to avoid modal/callback dependencies): `SystemStatusPanel` (connection row + UPTIME/BATTERY/NODES/TOPICS/SERVICES via `MockStatusRow`) and `ControlsPanel` (WASD D-pad via `MockDpadBtn` + LINEAR/ANGULAR readouts). The other four are the **real** workspace components rendered in a disconnected state: `ImuPanel`, `LidarPanel`, `TelemetryPanel` (all `connected={false}`, `ros={undefined}`), and `CameraPanel` (`connected={false}`, `robotUrl=""`).
- **Available actions:** None interactive (mock recreations have no handlers; real panels are passed disconnected props).
- **State / data sources:** **The only consumer of `useMockTelemetry`.** It drives the live readouts in the recreated panels: `telemetry.batteryLevel` → BATTERY %, `telemetry.linearVelocity` → LINEAR m/s, `telemetry.angularVelocity` → ANGULAR rad/s. (`imu`, `uptimeSeconds`, `lidarPoints`, and `telemetrySeries` are produced by the hook but the real `ImuPanel`/`LidarPanel`/`TelemetryPanel` here are mounted disconnected, so they show their empty/disconnected states rather than the mock streams.)
- **Notes:** Verify the BATTERY/LINEAR/ANGULAR numbers tick/animate live, the four real panels render their disconnected empty states cleanly inside the fixed frame, and nothing overflows the `h-96 overflow-hidden` container.

### Icons (`IconGrid`)

- **Responsibilities:** Renders every Lucide React icon used across the app from `ICON_SET` (27 entries — `LayoutGrid`, `Crosshair`, `Map`, `Settings`, `Plus`, `X`, `Wifi`, `WifiOff`, `Battery`, `Thermometer`, `Clock`, chevrons, `Maximize2`/`Minimize2`, `Sun`/`Moon`, `AlertTriangle`, `CheckCircle`, `XCircle`, `Camera`, `Compass`, `Activity`, `Radio`, `Palette`) at 20px (`size-5`) with the icon name beneath.
- **Available actions:** None.
- **State / data sources:** `ICON_SET` from `constants.ts`.
- **Notes:** Verify each icon resolves (no broken/missing glyph) and is legible at 20px against `bg-surface-secondary`.

### Border effects (`BorderEffects`)

- **Responsibilities:** Renders sample boxes for each panel border / shadow style from `BORDER_EFFECTS`: default border (`border-border`), hover border (`border-border-hover`), `shadow-glow-top`, `shadow-glow-bottom`, and accent border (`border-2 border-accent`). Each box shows "Panel content" with its class string labeled below.
- **Available actions:** None.
- **State / data sources:** `BORDER_EFFECTS` from `constants.ts`.
- **Notes:** Verify the glow shadows are visible against the page background and that the accent border uses the accent token — these are the panel-chrome treatments used across the workspace.

### Empty states (`EmptyStates`)

- **Responsibilities:** Renders three standalone empty-state patterns as **visual recreations** (deliberately not importing the real components, to avoid pulling in their modal dependencies): the **fleet empty state** ("No Robots Configured" + `Radio` icon + add-robot copy), a **camera panel empty** state (`Camera` icon, "Disconnected"), and a **panel offline** state (`WifiOff` in `text-status-offline`, "DISCONNECTED", `opacity-50`).
- **Available actions:** None.
- **State / data sources:** Static JSX; only `Radio`, `Camera`, `WifiOff` from `lucide-react`.
- **Notes:** Verify each empty state matches its production counterpart's tone and iconography, and that the offline state's reduced opacity still keeps text readable.

### Animations (`AnimationShowcase`)

- **Responsibilities:** Renders a demo box per motion pattern from `ANIMATION_LIST`: `pulse`, `spin`, `bounce`, `ping` — each as an accent dot with the corresponding `motion-safe:animate-*` class and a label.
- **Available actions:** None (animations auto-run).
- **State / data sources:** `ANIMATION_LIST` from `constants.ts`.
- **Notes:** All classes are gated with `motion-safe:`, so verify animations **stop** under `prefers-reduced-motion: reduce` and run otherwise.

## Manual test cases

### Happy path

- **TC-01 — Page loads:** Navigate to `/mockups`. The page renders inside `AppShell` with the sticky "Design System" nav on the left and the scrollable section list on the right.
- **TC-02 — All sections render:** Confirm all ten sections appear in `MOCK_SECTIONS` order: Color Tokens, Typography Scale, Spacing Scale, Status Indicators, Button Showcase, Panel Showcase, Icon Grid, Border Effects, Empty States, Animations. Each has its title + description from `constants.ts`.
- **TC-03 — Scroll-spy highlights active section:** Scroll the right pane; as each section enters the viewport its nav button gains `text-accent bg-accent-subtle font-semibold` and `aria-current="true"`. Exactly one item is active at a time.
- **TC-04 — Nav click scrolls:** Click a nav button (e.g. "Icon Grid"); the page smooth-scrolls so that section's top aligns, and the clicked item becomes the active highlight.
- **TC-05 — Mock-telemetry panels animate:** In Panel Showcase, confirm the recreated `SystemStatusPanel` BATTERY % and the `ControlsPanel` LINEAR/ANGULAR values change over time (driven by `useMockTelemetry` intervals — slow values every 1s, fast every 100ms).
- **TC-06 — Color swatches resolve:** In Color Tokens, every swatch shows a non-placeholder resolved value (not `...`) and a colored box.
- **TC-07 — Color theme toggle (local):** Click the theme toggle in Color Tokens; the swatch grid re-resolves for the other theme while the rest of the app's theme is unchanged.

### Edge cases

- **TC-E01 — Mobile viewport (375x812):** The nav and content remain usable; grids reflow to their small-screen column counts (Icon Grid `grid-cols-4`, Status `grid-cols-2`, Panels/Borders/Empty single column). No horizontal overflow.
- **TC-E02 — Light vs dark theme (global):** Toggle the app theme and re-audit Color Tokens, Status Indicators, and Border Effects for contrast — status colors stay distinguishable, glow shadows stay visible, text stays legible against backgrounds.
- **TC-E03 — Local theme isolation:** Toggle Color Tokens' local theme to `light` while the app is `dark` (and vice versa); only `#color-swatches-root` changes — the surrounding page and nav keep the global theme.
- **TC-E04 — Rapid scroll / scroll-spy stability:** Scroll quickly up and down. The active nav highlight tracks the dominant in-view section and never blanks out (hook only updates when `maxRatio > 0`); the `-10%` top/bottom `rootMargin` keeps the highlight settled on the section that owns most of the viewport.
- **TC-E05 — Reduced motion on Animations:** With `prefers-reduced-motion: reduce`, the pulse/spin/bounce/ping demos are static (`motion-safe:` gate); without it, all four animate. The `SystemStatusPanel` connection dot pulse (`motion-safe:animate-pulse`) follows the same rule.
- **TC-E06 — Empty states render:** All three Empty States cards render with correct icon, copy, and the offline card's `opacity-50` dimming — text remains readable.
- **TC-E07 — Disconnected real panels:** `ImuPanel`, `LidarPanel`, `TelemetryPanel`, and `CameraPanel` render their disconnected/empty states (passed `connected={false}`) inside the `h-96 overflow-hidden` frame with no content overflow or layout break.
- **TC-E08 — Telemetry interval cleanup:** Navigate away from `/mockups`; the `useMockTelemetry` slow/fast intervals clear on unmount (no runaway timers).
