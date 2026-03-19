# Phase 15: Mobile Responsive Nav - Research

**Researched:** 2026-03-19
**Domain:** Mobile responsive layout — bottom tab bar, swipeable carousel, kebab menus
**Confidence:** HIGH

<research_summary>

## Summary

Researched the mobile responsive stack for converting the desktop panel grid into a native-app-like mobile experience. The key finding: **shadcn already ships a Carousel component built on embla-carousel** — no need to install embla separately. For the bottom tab bar, there's no standard library — it's just CSS + conditional rendering with `useMobile()`. For the kebab menu, shadcn DropdownMenu works perfectly as a button-triggered menu.

**Primary recommendation:** Use shadcn Carousel (embla-based) for swipeable panel cards, custom BottomTabBar component with Tailwind + React Router, shadcn DropdownMenu for kebab menus, and conditional rendering (not CSS hiding) to switch between grid and carousel layouts.
</research_summary>

<standard_stack>

## Standard Stack

### Needs Installation

| Component            | Install Command                       | Purpose                                         |
| -------------------- | ------------------------------------- | ----------------------------------------------- |
| shadcn carousel      | `npx shadcn@latest add carousel`      | Swipeable panel cards (built on embla-carousel) |
| shadcn dropdown-menu | `npx shadcn@latest add dropdown-menu` | Kebab ⋮ button menu on mobile panels            |

### Already Available

| Library             | Purpose                                          | Status                    |
| ------------------- | ------------------------------------------------ | ------------------------- |
| react-router v7     | Navigation + route matching for tab active state | Installed                 |
| useMobile hook      | Breakpoint detection (<768px)                    | `src/hooks/use-mobile.ts` |
| Lucide icons        | Tab bar + kebab icons                            | Installed                 |
| Tailwind 4          | Bottom bar styling, responsive classes           | Installed                 |
| shadcn context-menu | Desktop right-click (Phase 14)                   | Installed                 |

### Alternatives Considered

| Instead of              | Could Use                          | Tradeoff                                                             |
| ----------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| shadcn Carousel (embla) | CSS scroll-snap                    | Zero dependencies but less control, no momentum physics, weaker a11y |
| Custom BottomTabBar     | react-native-tab-view / reach-tabs | Over-engineered for 4 tabs — just CSS + links                        |
| shadcn DropdownMenu     | Popover + custom menu              | DropdownMenu is purpose-built for this                               |

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Pattern 1: Conditional Layout Rendering (Grid vs Carousel)

**Best approach: conditionally render completely different components at the breakpoint.**

```tsx
export function PanelGrid({ viewId, robotId }: PanelGridProps) {
  const isMobile = useMobile();

  if (isMobile) {
    return <MobilePanelCarousel viewId={viewId} robotId={robotId} />;
  }

  return <Responsive /* existing desktop grid */ />;
}
```

**Why NOT CSS hiding:** react-grid-layout still runs all grid logic behind `display: none`, wasting performance. Touch interactions may also interfere.

### Pattern 2: shadcn Carousel for Mobile Panels

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';

function MobilePanelCarousel({ panels, viewId, robotId }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="flex flex-1 flex-col">
      <Carousel setApi={setApi} className="flex-1">
        <CarouselContent className="h-full">
          {panels.map((panel) => (
            <CarouselItem key={panel.id} className="h-full">
              <PanelFrame instance={panel} viewId={viewId} robotId={robotId} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 py-2">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              i === current ? 'bg-primary' : 'bg-muted'
            )}
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
```

### Pattern 3: Bottom Tab Bar

```tsx
function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/fleet', icon: Users, label: 'Fleet' },
    { path: '/map', icon: MapIcon, label: 'Map' },
    { path: '/pilot', icon: Gamepad2, label: 'Pilot' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex h-14 items-center justify-around border-t border-border bg-card">
      {tabs.map((tab) => {
        const isActive = location.pathname.includes(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-mono">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

### Pattern 4: Kebab Menu (DropdownMenu as Button Trigger)

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

function PanelKebabMenu({ onAddPanel, onRemove, onReset }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="panel-action-button p-1">
          <MoreVertical size={14} />
          <span className="sr-only">Panel actions</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onAddPanel}>Add Panel...</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
        <DropdownMenuItem onClick={onRemove}>Remove</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onReset}>Reset Layout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Anti-Patterns to Avoid

- **Don't hide react-grid-layout with CSS** — conditionally render instead
- **Don't build a custom carousel** — shadcn Carousel (embla) handles touch, momentum, a11y
- **Don't use react-native-tab-view for web** — it's React Native, not web
- **Don't use scroll-snap for complex carousel** — less control, weaker a11y than embla
  </architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem              | Don't Build                     | Use Instead                              | Why                                                 |
| -------------------- | ------------------------------- | ---------------------------------------- | --------------------------------------------------- |
| Swipeable carousel   | Custom touch event handling     | shadcn Carousel (embla)                  | Momentum physics, snap points, a11y, keyboard nav   |
| Dot indicators       | Custom position tracking        | embla API `selectedScrollSnap()`         | Already tracks position, emits 'select' events      |
| Kebab dropdown menu  | Custom popover with positioning | shadcn DropdownMenu                      | Handles positioning, focus trap, a11y, keyboard nav |
| Bottom tab bar       | Complex navigation library      | CSS fixed + React Router `useLocation()` | 4 tabs don't need a library                         |
| Breakpoint detection | Window resize listener          | Existing `useMobile()` hook              | Already built, uses media query                     |

**Key insight:** shadcn already provides Carousel and DropdownMenu. The only custom code needed is the BottomTabBar (simple CSS + React Router) and the MobilePanelCarousel (shadcn Carousel + panel rendering logic).
</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Carousel Height Not Filling Container

**What goes wrong:** Cards don't fill the available height between header and bottom bar
**Why it happens:** embla/shadcn Carousel doesn't auto-size to parent — needs explicit h-full chain
**How to avoid:** Ensure `h-full` is set on Carousel, CarouselContent, and CarouselItem. The parent must have a defined height (not auto).
**Warning signs:** Cards are tiny or collapsed to content height

### Pitfall 2: Bottom Bar Overlapping Content

**What goes wrong:** Fixed bottom bar covers the last bit of panel content
**Why it happens:** Fixed positioning removes from flow — content doesn't account for bar height
**How to avoid:** Add `pb-14` (or `pb-[3.5rem]`) padding-bottom to the main content container on mobile
**Warning signs:** Last panel card's bottom edge is behind the tab bar

### Pitfall 3: Pilot Mode Route Conflict

**What goes wrong:** Pilot tab navigates to `/pilot` but the route expects `/pilot/:robotId`
**Why it happens:** Pilot tab doesn't have a robotId — it needs to show a picker first
**How to avoid:** Create a `/pilot` route (no robotId) that renders the robot picker. Only `/pilot/:robotId` renders the fullscreen pilot.
**Warning signs:** 404 when tapping Pilot tab, or immediate redirect to /dashboard

### Pitfall 4: Grid Re-mounting on Breakpoint Change

**What goes wrong:** Switching between grid (desktop) and carousel (mobile) loses panel state
**Why it happens:** Conditional rendering unmounts one and mounts the other — React state is lost
**How to avoid:** Panel state is in Zustand store (not component state), so re-mounting is fine. Layout persists across mounts.
**Warning signs:** Panel positions reset when resizing — but this is actually correct behavior since breakpoints have different layouts.

### Pitfall 5: Kebab Menu Inside Carousel Swipe Zone

**What goes wrong:** Tapping the ⋮ kebab button triggers a carousel swipe instead of opening the menu
**Why it happens:** Touch event propagation — embla captures touch events on the carousel container
**How to avoid:** The kebab button is in the panel header which is outside the carousel's touch-action zone (embla uses `touch-action: pan-y pinch-zoom` on the container). If needed, add `touch-action: auto` to the button.
**Warning signs:** Menu opens briefly then closes as carousel scrolls
</common_pitfalls>

<open_questions>

## Open Questions

1. **Pilot route without robotId**
   - What we know: `/pilot/:robotId` is the current route pattern
   - What's unclear: Whether to add a new `/pilot` route for the picker, or handle it in the existing PilotView with optional param
   - Recommendation: Add a `/pilot` route that renders RobotPickerView. Keep `/pilot/:robotId` for the actual pilot mode.

2. **Carousel animation during tab switch**
   - What we know: Switching tabs (Dashboard → Map) changes the route
   - What's unclear: Should the carousel reset to first panel when returning to a tab, or remember position?
   - Recommendation: Reset to first panel on route change — simpler, no stale state
     </open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- `/davidjerleke/embla-carousel` (Context7) — React setup, dot buttons, CSS, API
- `/shadcn/ui` (Context7) — Carousel component (embla-based), DropdownMenu, installation
- react-grid-layout API docs (Context7) — breakpoint props, conditional rendering patterns

### Secondary (MEDIUM confidence)

- Web research agent — bottom tab bar patterns, embla vs scroll-snap comparison, DropdownMenu kebab pattern
- LogRocket blog — responsive layout patterns with React hooks
- Croct blog — carousel library comparison 2026

### Tertiary (LOW confidence)

- None — all findings cross-verified
  </sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: shadcn Carousel (embla-carousel), DropdownMenu
- Ecosystem: Bottom tab bar (custom), mobile panel layout
- Patterns: Conditional rendering, carousel with dots, kebab menus
- Pitfalls: Height filling, bottom bar overlap, route conflicts, swipe vs tap

**Confidence breakdown:**

- Standard stack: HIGH — shadcn components verified via Context7
- Architecture: HIGH — patterns are well-established
- Pitfalls: MEDIUM — some (like carousel height) need implementation testing
- Code examples: HIGH — from Context7 official docs

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (30 days — shadcn/embla ecosystem stable)
</metadata>

---

_Phase: 15-mobile-responsive-nav_
_Research completed: 2026-03-19_
_Ready for planning: yes_
