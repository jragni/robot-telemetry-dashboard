# Landing — Feature Guide

## Overview

The Landing page is the public marketing entry point for the Robot Telemetry Dashboard. It is the first screen a visitor sees and exists to communicate the product's value ("Connect. Monitor. Command.") and route visitors into the live application.

- **Route:** `/` (root). Registered in `src/App.tsx` as `<Route path="/" element={<LandingPage />} />`, **outside** the `AppShell` route group — so it has no sidebar, header bar, or status bar. It is lazy-loaded via `React.lazy` + `Suspense` (`src/App.tsx:9-11`, `:35`).
- **Component:** `LandingPage` in `src/features/landing/LandingPage.tsx`.
- **Key data sources:** Almost entirely **static**. The only runtime data is the feature card array `FEATURES` and the icon map `FEATURE_ICONS` from `src/features/landing/constants.ts` (typed by `FeatureItem` in `src/features/landing/types/LandingFeatures.types.ts`). There are no stores, no ROS subscriptions, and no data-fetching hooks.
- **Hooks used:**
  - `useEffect` in `LandingPage` to force the dark theme on mount: `document.documentElement.setAttribute('data-theme', 'dark')` (`LandingPage.tsx:15-17`). This is required because the page lives outside `AppShell`, which normally manages theme.
  - `useNavigate` (react-router-dom) in `LandingHero` and `LandingCTA` for programmatic navigation on button click.
- **Animation library:** **No GSAP / no JS animation library.** All motion and decorative effects are pure CSS, defined under the "Landing page" block in `src/index.css` (lines 366-486): scanlines, an animated scan beam, a 3D-perspective hero viewport, gradient dividers, and a feature-stagger layout. A `@media (prefers-reduced-motion: reduce)` block (`index.css:481-486`) disables the scan-beam animation.

## Flow map

Top-to-bottom render order, from `LandingPage.tsx:19-30`:

1. `LandingHeader` — fixed top nav (always visible while scrolling)
2. `LandingHero` — full-viewport hero
3. `.landing-divider` (gradient hairline)
4. `LandingFeatures` — `id="features"` anchor target
5. `.landing-divider` (gradient hairline)
6. `LandingProblemSolution`
7. `LandingCTA` — `id="demo"` anchor target
8. `LandingFooter`

Outbound navigation:

| Trigger                              | Source          | Type                   | Destination                                                         |
| ------------------------------------ | --------------- | ---------------------- | ------------------------------------------------------------------- |
| "Robot Telemetry Dashboard" wordmark | `LandingHeader` | `<Link to="/">`        | `/` (self / scroll-to-top)                                          |
| "Capabilities" nav link              | `LandingHeader` | `<a href="#features">` | In-page anchor → Features section                                   |
| "Demo" nav link                      | `LandingHeader` | `<a href="#demo">`     | In-page anchor → CTA section                                        |
| "GitHub" nav link                    | `LandingHeader` | `<a target="_blank">`  | `https://www.github.com/jragni/robot-telemetry-dashboard` (new tab) |
| "Launch Dashboard" button            | `LandingHero`   | `navigate('/fleet')`   | `/fleet` (primary CTA)                                              |
| "Try Demo" button (hero)             | `LandingHero`   | `navigate('/demo')`    | `/demo` (→ renders `FleetPage`, see note)                           |
| "Try Demo" button (bottom CTA)       | `LandingCTA`    | `navigate('/demo')`    | `/demo`                                                             |
| "GitHub" footer link                 | `LandingFooter` | `<a target="_blank">`  | GitHub repo (new tab)                                               |
| "Documentation" footer link          | `LandingFooter` | `<a target="_blank">`  | Same GitHub repo URL (new tab)                                      |

> Note: `/demo` and `/fleet` both render the same component — `<Route path="/demo" element={<FleetPage />} />` (`src/App.tsx:42`). The primary CTA goes to `/fleet`; both "Try Demo" buttons go to `/demo`.

## Segments

### Header / nav (`LandingHeader.tsx`)

- **Responsibilities:** Fixed branding bar pinned to the top (`fixed top-0 ... z-50`, `h-12`) with a bottom border + glow. Provides anchor navigation and a GitHub link.
- **Available actions:**
  - Wordmark "Robot Telemetry Dashboard" → `<Link to="/">` (returns to root).
  - "Capabilities" → `href="#features"` (scrolls to `LandingFeatures`), `aria-label="Jump to Capabilities section"`.
  - "Demo" → `href="#demo"` (scrolls to `LandingCTA`), `aria-label="Jump to Demo section"`.
  - "GitHub" → external repo, `target="_blank"` + `rel="noopener noreferrer"`, `aria-label="Open GitHub repository in new tab"`.
- **State / data sources:** None. Fully static markup.
- **Responsive behavior:** Wordmark always shown. The `<nav>` (Capabilities / Demo / GitHub) is `hidden sm:flex` — **hidden below the `sm` breakpoint (640px)** and revealed at `sm` and up. There is **no hamburger / mobile menu**; on phones only the wordmark remains. Horizontal padding steps from `px-4` to `sm:px-8`.

### Hero (`LandingHero.tsx`)

- **Responsibilities:** Full-height landing pitch. Eyebrow label ("Fleet Telemetry Platform"), the `<h1>` headline "Connect. / Monitor. / Command." (stacked via `<br>`), a value-prop paragraph, dual CTA buttons, and a decorative dashboard placeholder.
- **Available actions:**
  - "Launch Dashboard" (primary `Button`) → `navigate('/fleet')`. Hover lift + accent glow (`hover:shadow-glow-accent hover:-translate-y-0.5`).
  - "Try Demo" (outline `Button`) → `navigate('/demo')`.
- **State / data sources:** `useNavigate` for routing. Copy is hardcoded; no constants.
- **Hero dashboard placeholder:** The right column is a **decorative empty box**, not a real screenshot — `<div class="... aspect-video landing-hero-viewport" />` with no `<img>`. It is styled in `index.css`: `.landing-hero-perspective` applies `perspective: 1200px` and `.landing-hero-viewport` tilts it with `transform: rotateY(-6deg) rotateX(2deg)` and `aspect-ratio: 16/10`, plus `shadow-glow-accent-heavy`. Because there is no image, there is no broken-image risk.
- **Animations:** The section carries `landing-scanlines` (faint diagonal `::before` overlay, opacity 0.02) and `landing-scan-beam` (a translucent accent beam that sweeps top→bottom every 10s via the `landing-scan-beam` keyframes, `::after`). The beam is disabled under reduced-motion.
- **Responsive behavior:** Layout grid is `grid-cols-1` on mobile and `md:grid-cols-[1fr_1.4fr]` (two columns) at the `md` breakpoint (768px). The hero placeholder column is `hidden md:block` — **not rendered on mobile/tablet below `md`**. CTA buttons stack `flex-col` on mobile and become `sm:flex-row`. Content width capped at `max-w-300`; top padding `pt-12` clears the fixed header.

### Problem / Solution (`LandingProblemSolution.tsx`)

- **Responsibilities:** Two-column narrative contrasting "The Problem — Fragmented Toolchains" with "The Solution — One Tab. Full Control." Reinforces the rosbridge/fleet-first positioning.
- **Available actions:** None — informational copy only, no links or buttons.
- **State / data sources:** None; static copy.
- **Animations / decoration:** The grid carries `landing-ps-grid`, whose `::after` (`index.css:450-465`) draws a vertical gradient divider down the center between the two columns.
- **Responsive behavior:** `grid-cols-1` on mobile → `md:grid-cols-2`. Gap widens `gap-8` → `sm:gap-24`; vertical padding `py-12` → `sm:py-24`. The center divider is **hidden on mobile** (`.landing-ps-grid::after { display: none }` under `max-width: 767px`, `index.css:475-477`).

### Features (`LandingFeatures.tsx`)

- **Responsibilities:** Showcases the four core capabilities. Section header "Capabilities / Built for Operators", then one row per feature rendered by mapping over `FEATURES`. This section is the `#features` anchor target.
- **Feature cards (order and content from `constants.ts`):**
  1. **01 — Pilot Mode** (icon `Joystick`): first-person robot control, live camera feed filling the viewport with D-pad/velocity overlays and a LiDAR minimap. _Pilot Mode is intentionally feature #1._
  2. **02 — Fleet-First Navigation** (icon `LayoutGrid`): all robots at a glance, drill into one for telemetry/controls/diagnostics.
  3. **03 — Live Telemetry** (icon `Activity`): IMU orientation, time-series plots, LiDAR radar, raw topic values streaming up to 10Hz with ring buffers.
  4. **04 — Multi-Robot** (icon `Network`): simultaneous connections, independent status tracking, per-robot workspaces.
- **Available actions:** None — display only; no per-card links/buttons.
- **State / data sources:** `FEATURES` (array of `FeatureItem`) and `FEATURE_ICONS` (number → `LucideIcon` map) from `constants.ts`. The icon lookup falls back to `Activity` if a number is unmatched (`FEATURE_ICONS[feature.number] ?? Activity`, `LandingFeatures.tsx:21`). Each card's visual panel is a placeholder box showing the Lucide icon at `size={36}` / `opacity-30` — again, no images.
- **Animations / decoration:** Each row uses `landing-feature` + `landing-feature-content` / `landing-feature-visual`. CSS `:nth-child(odd/even)` rules (`index.css:436-447`) alternate the content/visual column order to create a left-right zigzag stagger across rows.
- **Responsive behavior:** Each row is `grid-cols-1` → `md:grid-cols-2`. The zigzag stagger is **forced off below 768px** (`index.css:468-474` resets content to `order: 1` and visual to `order: 2`), so on mobile every row reads text-above-visual. Visual panel height `h-28` → `sm:h-40`; row spacing `mb-10` → `sm:mb-20` (`last:mb-0`).

### CTA (`LandingCTA.tsx`)

- **Responsibilities:** Closing conversion section ("See It in Action") encouraging the visitor into the no-rosbridge demo. This section is the `#demo` anchor target.
- **Available actions:** "Try Demo" (primary `Button`) → `navigate('/demo')`, with the same hover lift + accent glow as the hero primary button.
- **State / data sources:** `useNavigate`; static copy.
- **Responsive behavior:** Centered single column (`text-center flex flex-col items-center`). Padding `py-12` → `sm:py-24`, `px-4` → `sm:px-8`. Copy capped at `max-w-100`.

### Footer (`LandingFooter.tsx`)

- **Responsibilities:** Closing branding, external links, and copyright ("© jragni 2026").
- **Available actions:**
  - "GitHub" → external repo, new tab (`target="_blank"` + `rel="noopener noreferrer"`).
  - "Documentation" → currently points to the **same GitHub repo URL** (new tab).
- **State / data sources:** None; static markup.
- **Responsive behavior:** `flex-col` on mobile, `md:flex-row` (brand left, links + copyright right) at `md`. The inner link/copyright cluster likewise flips `flex-col` → `md:flex-row`.

---

## Manual test cases

> Existing automated coverage lives in `src/features/landing/LandingPage.test.tsx` (renders inside `MemoryRouter`): asserts header/footer branding, the `<h1>` headline text, the Features header, both CTA buttons, footer copyright, header anchor hrefs (`#features` / `#demo`), the external GitHub link (`target="_blank"`), and that mount forces `data-theme="dark"`. The cases below are the manual/visual layer on top of that.

### Happy path

- **TC-01 — Load and theme.** Navigate to `/`. Page renders with no sidebar/header bar/status bar (outside `AppShell`). `<html data-theme="dark">` is set on mount.
- **TC-02 — Header renders and stays fixed.** Header is pinned to top with wordmark + (on desktop) Capabilities / Demo / GitHub nav. Header remains visible while scrolling down the page.
- **TC-03 — Hero renders.** Eyebrow "Fleet Telemetry Platform", `<h1>` reading "Connect. / Monitor. / Command.", the value-prop paragraph, both CTA buttons, and (desktop) the tilted dashboard placeholder box are all visible.
- **TC-04 — Scroll through every section in order.** Scrolling top→bottom reveals: Hero → divider → Features → divider → Problem/Solution → CTA → Footer. Two gradient `.landing-divider` hairlines appear between Hero/Features and Features/Problem-Solution.
- **TC-05 — Feature cards render in order.** Four cards render in order 01 Pilot Mode, 02 Fleet-First Navigation, 03 Live Telemetry, 04 Multi-Robot, each with its Lucide icon (Joystick / LayoutGrid / Activity / Network) and the alternating left-right zigzag layout on desktop.
- **TC-06 — Primary CTA routes to /fleet.** Click "Launch Dashboard" in the hero → app navigates to `/fleet` and the Fleet page (inside `AppShell`) renders.
- **TC-07 — Hero "Try Demo" routes to /demo.** Click hero "Try Demo" → navigates to `/demo` (renders `FleetPage`).
- **TC-08 — Bottom CTA "Try Demo" routes to /demo.** Click the "Try Demo" button in the CTA section → navigates to `/demo`.
- **TC-09 — Header anchor: Capabilities.** Click "Capabilities" → page scrolls to the Features section (`#features`).
- **TC-10 — Header anchor: Demo.** Click "Demo" → page scrolls to the CTA section (`#demo`).
- **TC-11 — Header GitHub link.** Click header "GitHub" → opens the repo URL in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).
- **TC-12 — Wordmark link.** Click the header wordmark → routes to `/` (scrolls/returns to top).
- **TC-13 — Footer links.** Footer "GitHub" and "Documentation" both open the repo URL in a new tab; copyright "© jragni 2026" is visible.
- **TC-14 — Scan-beam animation fires.** With default motion settings, the hero shows the translucent accent beam sweeping top→bottom (10s loop) and the faint diagonal scanline texture.

### Edge cases

- **TC-E01 — Mobile viewport (375×812).** Header nav links are hidden (only wordmark shows); there is intentionally no hamburger menu — verify nav is simply absent, not broken. Hero is single-column with the dashboard placeholder hidden (`hidden md:block`). CTA buttons stack vertically.
- **TC-E02 — Mobile feature stagger.** At ≤767px every feature row reads text-above-visual (zigzag disabled); no row shows the visual above its text.
- **TC-E03 — Mobile Problem/Solution divider.** At ≤767px the center vertical divider (`.landing-ps-grid::after`) is hidden; the two blocks stack vertically with no stray line.
- **TC-E04 — Reduced motion.** With `prefers-reduced-motion: reduce`, the scan-beam animation is disabled/removed (`index.css:481-486`); page is fully readable and static. Scanline texture (non-animated) may remain.
- **TC-E05 — Very narrow viewport (~320px).** No horizontal overflow / scrollbar; headline, paragraph, and stacked CTA buttons stay within the viewport (padding `px-4`).
- **TC-E06 — Very wide viewport (≥1920px).** Content is centered and capped at `max-w-300` (1200px); dividers (`max-width: 1200px`) align with content; no edge-to-edge stretching.
- **TC-E07 — Deep-link back from /fleet.** From `/fleet` (or `/demo`), navigate back to `/` (browser back or wordmark) → landing renders correctly and `data-theme` is re-asserted to dark on mount.
- **TC-E08 — Placeholder integrity (no broken images).** The hero viewport box and the four feature visual panels are pure CSS/icon placeholders with no `<img>` — confirm no broken-image icon appears and the Lucide icons render at `opacity-30`. If a feature number ever lacked a mapped icon, it falls back to the `Activity` icon (`?? Activity`).
- **TC-E09 — Keyboard / focus navigation.** Tab through interactive elements (wordmark → Capabilities → Demo → GitHub → Launch Dashboard → Try Demo → footer links). Each shows a visible focus ring (`focus-visible:ring-2 focus-visible:ring-accent`). Enter activates links/buttons; the two CTA buttons trigger navigation via keyboard.
- **TC-E10 — External-link safety.** All `target="_blank"` links (header GitHub, footer GitHub, footer Documentation) carry `rel="noopener noreferrer"`.
