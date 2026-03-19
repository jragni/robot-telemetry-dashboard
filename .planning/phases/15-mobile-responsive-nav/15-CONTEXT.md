# Phase 15: Mobile Responsive Nav - Context

**Gathered:** 2026-03-19
**Status:** Ready for research + TDD planning

<vision>
## How This Should Work

On mobile (<768px), the dashboard transforms into a native app-like experience. A fixed bottom tab bar provides navigation between Dashboard, Fleet, Map, and Pilot. The header shrinks to just the title and hamburger. Panels become swipeable full-height cards — one panel visible at a time, swipe left/right to see others, dot indicators show position.

**Bottom Tab Bar (mobile only):**

- 4 tabs: Dashboard, Fleet, Map, Pilot
- Fixed to bottom of screen, always visible (except in pilot mode)
- Active tab has highlighted icon + label in primary color
- Inactive tabs show muted icon + label
- Desktop (>=768px) keeps the header nav links, no bottom bar

**Swipeable Panel Cards (Dashboard + Map only):**

- On mobile, panels display as a horizontal carousel
- Each card fills the full available height (between header and bottom bar)
- Swipe left/right to navigate between panels
- Dot indicators below the card show position (current dot highlighted)
- One panel visible at a time — full-screen immersive feel

**Pilot Tab Behavior:**

- Tap Pilot tab → robot picker screen (list connected robots with Launch button)
- If no robots connected → message + link to add a robot
- Launch → fullscreen pilot mode (existing PilotMobileLayout)
- Bottom tab bar hides during pilot mode (immersive)
- Exit pilot via existing [X] button → returns to previous view

**Mobile Panel Interaction:**

- Drag and resize DISABLED on mobile — panels are fixed in the swipe carousel
- Each panel gets a ⋮ kebab menu button in the header (replaces right-click context menu)
- Kebab menu has: Add Panel, Duplicate (disabled), Remove, Reset Layout
- No right-click on touch — kebab button is the mobile equivalent

**Landscape on Phone:**

- Stay in swipe card mode (don't switch to grid)
- Card gets wider but behavior stays the same

</vision>

<essential>
## What Must Be Nailed

- **Bottom tab bar** — 4 tabs (Dashboard, Fleet, Map, Pilot), fixed bottom, mobile only, active state highlighted
- **Swipeable panel cards** — horizontal carousel on Dashboard and Map, full-height, dot indicators, one panel at a time
- **Pilot tab** — robot picker when no robot selected, launches fullscreen pilot, hides bottom bar during pilot
- **Kebab menu on mobile panels** — ⋮ button replaces right-click context menu on touch devices
- **Disable drag/resize on mobile** — panels are view-only in the swipe carousel
- **Desktop unchanged** — header nav stays, no bottom bar, panels work as current grid

</essential>

<boundaries>
## What's Out of Scope

- No sidebar redesign — sidebar overlay stays as-is on mobile
- No pilot mode changes — PilotMobileLayout already works, just need to integrate with bottom tabs
- No Fleet view mobile changes — Fleet already has its own mobile layout (stacked cards)
- No tablet-specific layout (768-1024px) — tablet uses the existing md breakpoint grid
- No swipe cards on Fleet view — Fleet keeps its existing robot card layout
- No offline support or PWA features

</boundaries>

<specifics>
## Specific Ideas

- Bottom tab bar icons: use Lucide icons matching the defense-contractor aesthetic (LayoutDashboard, Users, Map, Gamepad2)
- Dot indicators: small circles, primary color for active, muted for inactive
- Swipe library: consider embla-carousel or native CSS scroll-snap — research needed
- Breakpoint: use the existing `useMobile()` hook (<768px) as the toggle between desktop and mobile layouts
- Robot picker on Pilot tab: simple list from `useConnectionsStore`, each row shows name + status + Launch button
- Kebab menu: reuse the existing PanelContextMenu logic but triggered by a button instead of right-click

</specifics>

<notes>
## Additional Context

**TDD approach for this phase:**

- Write E2E tests FIRST for: bottom tab navigation, swipe behavior, pilot tab routing, kebab menu interactions
- Write unit tests FIRST for: any new hooks (useSwipePanels, useMobileNav), robot picker logic
- Then implement to make tests pass

**Edge cases to test:**

- Viewport resize from desktop to mobile mid-session (bottom bar appears, panels switch to swipe)
- Viewport resize from mobile to desktop (bottom bar disappears, panels switch back to grid)
- Pilot mode entry/exit (bottom bar hides/shows)
- No robots connected → pilot tab shows picker with empty state
- Panel add/remove via kebab menu while in swipe mode
- Reset layout in swipe mode → carousel refreshes with default panels

**Known issue from Phase 14:**

- When sidebar is open at 1440px, grid container is ~1160px (below lg breakpoint 1200px), so panels fall to md layout. Consider lowering lg breakpoint to account for sidebar, or accept this behavior.

</notes>

---

_Phase: 15-mobile-responsive-nav_
_Context gathered: 2026-03-19_
