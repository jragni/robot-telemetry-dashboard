# Pitfalls Research

**Domain:** Robot telemetry dashboard (ROS2, real-time WebSocket, canvas rendering, React)
**Researched:** 2026-03-22
**Confidence:** HIGH (combines 3 prior rebuild post-mortems + current ecosystem research)

---

## Critical Pitfalls

### Pitfall 1: roslib Topic Subscriptions Die on WebSocket Reconnect

**What goes wrong:**
When the rosbridge WebSocket connection drops (robot reboots, network blip, rosbridge restart), roslib reconnects the transport but does NOT automatically re-establish topic subscriptions or advertisements. The dashboard shows "Connected" but receives zero data. Operators think the robot stopped sending telemetry when it is actually the subscription that is gone.

**Why it happens:**
roslib's reconnection PR (#267) added transport-level reconnect, but topic objects do not reliably re-send their subscribe messages on the new connection. The `Ros` object emits a `connection` event on reconnect, but unless application code explicitly re-subscribes all topics, they are orphaned.

**How to avoid:**
Build the RxJS subscription layer to track all active topic subscriptions in a registry. On `ros.on('connection')` (reconnect event), iterate the registry and re-subscribe every topic. The RxJS Subject stays alive -- only the underlying roslib Topic needs re-subscribing. This is the RxJS service layer's job, NOT the component layer's job.

**Warning signs:**
- Dashboard shows "Connected" status but all telemetry panels show stale/frozen data
- Works fine on first connection, breaks after any network interruption
- E2E test passes because it never tests reconnection

**Phase to address:**
Data layer / roslib transport phase. Must be in the core connection manager before any telemetry features are built on top.

---

### Pitfall 2: React Re-render Cascade from High-Frequency ROS Topics

**What goes wrong:**
ROS topics like IMU publish at 100-200Hz. Naively piping every message into React state causes 100+ re-renders per second per topic, per subscribed component. With 5 telemetry panels open, that is 500+ renders/second. The UI freezes, CPU pegs at 100%, and the browser tab becomes unresponsive.

**Why it happens:**
Developers wire `topic.subscribe(msg => setState(msg))` directly, or push every RxJS emission into Zustand without throttling. React 19's compiler helps with memoization but cannot fix the fundamental problem of updating state 200 times per second.

**How to avoid:**
Throttle at the RxJS layer, NOT the component layer. Use `throttleTime(50)` (20fps) for display-bound topics (IMU orientation, velocity). Use `bufferTime(100)` for plot data (collect points, push batch). Use `sampleTime(1000)` for slow-changing topics (battery, temperature). The Zustand store should receive pre-throttled data -- components never subscribe to raw ROS topic streams.

**Warning signs:**
- React DevTools Profiler shows >30 renders/second on telemetry components
- `performance.now()` gaps in requestAnimationFrame exceed 32ms (dropping below 30fps)
- CPU usage spikes when opening telemetry panels

**Phase to address:**
Data layer phase. Throttle configuration must exist before any telemetry UI components consume the data.

---

### Pitfall 3: Tests Pass on a Broken App (Proven Failure -- v3 Post-Mortem)

**What goes wrong:**
Unit and integration tests verify code structure (component renders, state updates, function calls) but not visual output. In v3, 468 tests passed while the actual screen was completely blank. The test suite provided false confidence that killed an entire rebuild attempt.

**Why it happens:**
Tests mock roslib connections, verify DOM node existence, and check state transitions. None of that catches: CSS making everything invisible, a layout component rendering zero-height, a router not matching any route, or a theme class missing from `<html>`. Code-level reviewers compound this by evaluating DOM structure instead of screenshots.

**How to avoid:**
Three-layer verification at every phase:
1. **Unit tests** -- logic correctness (stores, utilities, hooks)
2. **Playwright structural assertions** -- verify visible text, element counts, viewport dimensions
3. **Screenshot comparison** -- Playwright `page.screenshot()` reviewed by a human or visual regression tool

The critical addition is #3. Every phase that touches UI must produce a screenshot that a human reviews. "Tests pass" is necessary but NEVER sufficient for a visual product.

**Warning signs:**
- All tests pass but nobody has looked at the app in a browser recently
- A destructive refactor (IA redesign, layout rewrite) has no visual continuity checkpoint
- Test coverage is high but tests only assert `toBeInTheDocument()`, never visual properties

**Phase to address:**
Project setup phase (Playwright config) and enforced at EVERY subsequent phase via the quality gate. This is a process pitfall, not a code pitfall.

---

### Pitfall 4: Canvas Rendering Outside React's Lifecycle

**What goes wrong:**
Canvas elements (occupancy grid map, LiDAR visualization) bypass React's virtual DOM. When the canvas ref is null (component not mounted yet, or unmounted during navigation), drawing calls throw. When React re-renders the parent, the canvas clears unless explicitly preserved. When the component unmounts, animation frames continue firing on a detached canvas, leaking memory.

**Why it happens:**
Canvas is imperative; React is declarative. Developers treat canvas like a React component (render once, forget) instead of managing its lifecycle explicitly. The occupancy grid is especially dangerous because it receives large binary payloads (84KB+ per update) that must be decoded and drawn.

**How to avoid:**
- Guard every draw call: `if (!canvasRef.current) return`
- Use `useEffect` cleanup to cancel `requestAnimationFrame` and clear canvas context
- Never store canvas context in React state (it is a ref, not state)
- For occupancy grid: decode the CompressedImage/OccupancyGrid message in a Web Worker, transfer the ImageBitmap to the main thread, draw in one `drawImage` call
- Use `OffscreenCanvas` where browser support allows for worker-based rendering

**Warning signs:**
- "Cannot read properties of null (reading 'getContext')" errors in console
- Memory usage climbs steadily when navigating between robot views
- Map panel flickers or goes white when resizing the sidebar

**Phase to address:**
Canvas/map visualization phase. Must be built with explicit lifecycle management from the start -- retrofitting is painful.

---

### Pitfall 5: RxJS Subscription Memory Leaks (Zombie Subscriptions)

**What goes wrong:**
RxJS subscriptions created in React components or hooks are not cleaned up on unmount. The subscription continues receiving data, updating stores, and holding references to unmounted components. With per-robot topic subscriptions, navigating between robots accumulates zombie subscriptions. After visiting 8 robots, there are 8x the active subscriptions, each consuming bandwidth and CPU.

**Why it happens:**
Developers forget the `useEffect` cleanup function, or they subscribe inside an event handler instead of a lifecycle hook. The RxJS-to-Zustand bridge layer can also leak if subscriptions are created per-component instead of per-store.

**How to avoid:**
- Subscriptions belong in the RxJS service layer, NOT in React components
- Use `takeUntil(destroy$)` pattern on every subscription chain
- The RxJS-to-Zustand bridge creates subscriptions once per store slice, not once per component mount
- Add a subscription counter to dev tools: `if (activeSubscriptions > expectedMax) console.warn(...)`
- On robot disconnect/navigation away: explicitly call `topic.unsubscribe()` and complete the Subject

**Warning signs:**
- `performance.memory.usedJSHeapSize` grows monotonically during a session
- Network tab shows increasing WebSocket frame rate over time
- Console warnings about state updates on unmounted components

**Phase to address:**
Data layer phase. The subscription lifecycle pattern must be established before any feature subscribes to topics.

---

### Pitfall 6: WidthProvider + Resizable Sidebar = Layout Thrashing

**What goes wrong:**
react-grid-layout's `WidthProvider` HOC listens to `window.resize` events. When the layout's width changes come from a resizable sidebar (not the window), WidthProvider either doesn't detect the change (grid overflows) or detects it too late (visual jump). During sidebar drag, the grid receives width updates at 60fps, causing re-layout calculations that drop the frame rate below 15fps.

**Why it happens:**
`WidthProvider` was designed for responsive breakpoints triggered by window resize, not continuous width changes from a sibling element. It uses `window.onresize` which doesn't fire when a CSS sibling changes width.

**How to avoid:**
Do NOT use `WidthProvider`. Use a `useElementSize` hook (ResizeObserver on the grid container) and pass `width` directly to `ReactGridLayout`. Debounce the ResizeObserver callback at 16ms (one frame) to prevent layout thrashing during sidebar drag.

**Warning signs:**
- Grid items overlap or overflow when sidebar is resized
- Janky/laggy animation when dragging the sidebar resize handle
- Grid "jumps" to correct size after sidebar drag ends

**Phase to address:**
Layout/shell phase. The grid width strategy must be decided before any panel content is built.

---

### Pitfall 7: WebSocket Zombie Connections and Missing Heartbeats

**What goes wrong:**
The rosbridge WebSocket connection enters a "zombie" state: TCP considers it alive, the browser considers it alive, but no data flows. The dashboard shows "Connected" with frozen telemetry. The operator does not know the robot is unreachable. This is different from Pitfall 1 (reconnect) -- here the connection never drops, so no reconnect is triggered.

**Why it happens:**
TCP keep-alive defaults to 2 hours on most systems. If the network path degrades (WiFi dropout, robot moves out of range), packets are silently dropped. Neither side detects the failure for minutes to hours.

**How to avoid:**
Implement application-level heartbeat:
- Send a rosbridge service call or custom ping every 5 seconds
- If no response within 3 seconds, mark connection as "degraded" (yellow indicator)
- If no response for 3 consecutive pings (15 seconds), force-close and reconnect
- Display the round-trip latency in the robot status card
- Use exponential backoff with jitter on reconnect attempts (500ms initial, 30s cap)

**Warning signs:**
- Dashboard shows "Connected" but telemetry is frozen (no errors in console)
- Works on local network, fails over WiFi/VPN where packet loss is common
- E2E tests never simulate network degradation

**Phase to address:**
Connection management phase. Must be built into the roslib transport layer alongside the reconnection logic.

---

### Pitfall 8: AI Agent Builds Features That Never Get Wired Into Views

**What goes wrong:**
AI agents build feature components in isolation -- they pass unit tests, have correct props, and render correctly in isolation. But they never get imported into the actual view that the user sees. The result is a codebase full of well-tested, unused components and views that show placeholder text. v2 had this exact failure: DashboardView and MapView showed "Coming soon" despite all features being built and tested.

**Why it happens:**
AI agents optimize for the immediate task ("build a LiDAR component") without maintaining awareness of the integration surface. Each phase works on its own concern, and nobody verifies that the output of Phase N appears in the actual rendered app. Tests verify the component works, not that it is reachable from the router.

**How to avoid:**
- Every phase that builds a component must also wire it into its parent view in the same phase
- Integration verification: Playwright test navigates to the route and asserts the component's visible text/elements exist
- "Looks Done But Isn't" checklist (see below) run at every phase gate
- Phase scoping rule: max 5 components per phase, and every component must be rendered in the app by phase end

**Warning signs:**
- `grep -r "import.*ComponentName" src/` returns only the test file and the component itself
- Views contain `<div>Coming soon</div>` or `{/* TODO */}` placeholders
- Feature demos work in Storybook but not in the actual app

**Phase to address:**
Every phase. This is the #1 process pitfall for AI-assisted development. The quality gate must verify integration, not just existence.

---

### Pitfall 9: Dark Theme Applied to Components But Not the HTML Root

**What goes wrong:**
Components use CSS variables or Tailwind's `dark:` variants correctly, but the theme class/attribute is missing from `<html>` or `<body>`. Result: every component looks correct in isolation tests but the app renders in light mode (or with broken colors) because the cascade root is wrong. v3 had this for 7 consecutive phases before anyone noticed.

**Why it happens:**
Theme setup is "infrastructure" that gets done once and forgotten. AI agents focus on component-level styling and assume the root is configured. Nobody checks the `<html>` element because tests render components in isolation with mocked theme context.

**How to avoid:**
- Phase 1 (project setup) must set `data-theme` on `<html>` in `index.html` with a default
- Playwright test in the setup phase: `expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')`
- Theme toggle component must modify `document.documentElement.dataset.theme`, verified by Playwright
- CSS custom properties defined at `:root[data-theme="dark"]` scope, not at component level

**Warning signs:**
- Components look correct in Vitest/JSDOM but wrong in the actual browser
- `getComputedStyle(document.documentElement).getPropertyValue('--color-bg')` returns empty or the light-mode value
- Theme toggle "works" (state changes) but nothing visual changes

**Phase to address:**
Project setup / design system phase. Must be verified in the first phase that renders any visual output.

---

### Pitfall 10: Dynamic rowHeight Infinite Loop (Proven Failure -- ISS-008)

**What goes wrong:**
react-grid-layout's `rowHeight` is computed dynamically from the container's height. When panels stack vertically (responsive breakpoint), the container grows with content. Larger container means larger rowHeight, which means larger panels, which means larger container. Browser crashes at 16,777,215px height.

**Why it happens:**
Seems logical to derive rowHeight from container size for responsive behavior. The circular dependency is not obvious until the breakpoint where panels stack vertically.

**How to avoid:**
- `lg` breakpoint: derive from `window.innerHeight` (stable anchor, not affected by content)
- `md`/`sm` breakpoints: use static rowHeight (60px)
- Never derive a dimension from its own container when that container grows with content

**Warning signs:**
- Browser tab crashes or becomes unresponsive when resizing window to mobile width
- `ResizeObserver loop limit exceeded` warnings in console
- Panel heights grow visually during resize

**Phase to address:**
Layout phase. The rowHeight strategy is a layout-level decision that must be made before any panel content.

---

### Pitfall 11: React 19 Compatibility Gaps in Dashboard Libraries

**What goes wrong:**
Recharts and react-grid-layout have incomplete React 19 support. Recharts silently fails to render charts without the `react-is` override. react-grid-layout may throw runtime errors from deprecated lifecycle methods.

**Why it happens:**
These libraries depend on React internals (`react-is`, legacy lifecycle methods) that changed in React 19.

**How to avoid:**
In Phase 1 scaffolding, add a smoke test that renders a basic Recharts chart and a react-grid-layout grid. Add the `react-is` override to package.json immediately. If react-grid-layout fails, swap to the `react-grid-layout-19` community fork.

**Warning signs:**
- Charts render as empty SVG containers
- Console warnings about deprecated lifecycle methods
- Grid items do not respond to drag/resize

**Phase to address:**
Scaffolding phase. Must be validated before any UI components depend on these libraries.

---

### Pitfall 12: roslib CommonJS Module in ESM/Vite Build

**What goes wrong:**
roslib is a CommonJS package. Vite's dev server handles ESM by default. Importing roslib without configuration causes "require is not defined" or silent failures where roslib appears imported but all classes are undefined.

**Why it happens:**
Vite pre-bundles dependencies as ESM. CJS packages need explicit inclusion in `optimizeDeps.include` to be pre-bundled correctly. This has broken every prior rebuild.

**How to avoid:**
Add to `vite.config.ts` on day one:
```typescript
optimizeDeps: { include: ['roslib'] }
```
Note: if roslib 2.0 ships as ESM-only (check at project start), this workaround becomes unnecessary but import patterns change.

**Warning signs:**
- `ROSLIB is not defined` at runtime
- roslib import resolves but `new ROSLIB.Ros()` throws
- Works in one Vite mode (dev vs build) but not the other

**Phase to address:**
Scaffolding phase, first line of defense. Test roslib import in Phase 1.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Barrel files (`index.ts` re-exports) | Cleaner imports | 68% module bloat, tree-shaking failure | Never (ADR-001) |
| `any` type for ROS messages | Faster development | No autocompletion, runtime errors from message shape changes | Never -- define `.types.ts` per message type |
| Inline RxJS operators in components | Quick feature | Untestable, not reusable, leak-prone | Never -- operators belong in service layer |
| `console.log` for debugging | Fast feedback | 52+ left in production (v1), noise in console | Only behind `import.meta.env.DEV` guard |
| Single monolithic Zustand store | Simpler initial setup | Every state change re-renders everything, grows to 500+ lines | Never -- use domain-sliced stores from day 1 |
| Skipping Playwright for "logic-only" phases | Faster phase completion | Breaks visual continuity, "468 tests pass, blank screen" | Never -- every phase gets at least a smoke screenshot |
| Fixed 8-robot array for hooks compliance | Avoids Rules of Hooks violation | Silently drops 9th+ robot | MVP only -- replace with dynamic subscription pattern |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| roslib + Vite | Import fails because roslib is CommonJS | Add `optimizeDeps: { include: ['roslib'] }` in `vite.config.ts` |
| roslib + TypeScript | Using `@types/roslib` which is outdated/incomplete | Write thin `.d.ts` wrappers for used classes or use community types |
| RxJS + Zustand | Creating subscriptions inside React components | Create subscriptions in service layer, bridge to Zustand stores, components only read stores |
| react-grid-layout + React 18/19 | Drag/resize cursor desync from automatic batching | Wrap drag/resize callbacks in `flushSync` if needed; use `layoutRef` pattern |
| react-resizable-panels + react-grid-layout | Sidebar resize does not trigger grid re-layout | Use `useElementSize` (ResizeObserver) on grid container, pass width directly |
| OccupancyGrid + Canvas | Decoding 84KB+ messages on main thread blocks UI | Decode in Web Worker, transfer ImageBitmap, draw with single `drawImage` call |
| Tailwind dark mode + data-theme | `dark:` variant doesn't work with `data-theme` attribute | Configure `darkMode: ['selector', '[data-theme="dark"]']` in Tailwind config |
| onLayoutChange + resetLayout | Race condition: onLayoutChange fires immediately after reset, re-saving old layout | Use `skipNextSaveRef` flag pattern |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unthrottled IMU updates to React state | UI freezes, 100% CPU | `throttleTime(50)` in RxJS layer | >50Hz topic frequency |
| Re-rendering entire grid on any panel data change | Drag/resize lag | Zustand selectors per panel, `React.memo` on grid items | >3 panels with live data |
| Canvas redraw on every React render | Map flickers, GPU spikes | Separate canvas update loop from React lifecycle via refs | Any canvas in a frequently-updating parent |
| Storing full message history in memory | Tab crashes after hours | Ring buffer (fixed-size array), configurable window (last 1000 points) | >10 min continuous data at >10Hz |
| JSON serialization of large ROS messages | GC pauses, frame drops | Avoid serializing what you don't display; consider CBOR encoding | Messages >10KB (OccupancyGrid, PointCloud) |
| SVG-based charts with thousands of data points | Chart render takes >100ms | Use canvas-based chart rendering or downsample data | >500 data points per chart |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing rosbridge port to public internet | Anyone can send velocity commands to the robot | Bind rosbridge to localhost or LAN only; document in README |
| No E-Stop confirmation in software | Accidental motor activation | Software E-Stop is advisory only; display warning that hardware E-Stop is required |
| API keys committed to repo | Key exposure (happened in v2 with 21st.dev key) | `.gitignore` BEFORE creating any config file with keys; use `.env.local` |
| WebSocket connection without TLS over shared network | Command injection / telemetry interception | Use `wss://` when not on localhost; rosbridge supports SSL |
| Velocity commands sent without rate limiting | Operator input noise causes erratic robot behavior | Debounce control inputs at 10Hz; clamp velocity values to safe ranges |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Stale data shown as live | Operator makes decisions on old telemetry | Show "last updated: Xs ago" on every data panel; gray out data older than 5s |
| No visual distinction between connected/degraded/disconnected | Operator trusts frozen dashboard | Three-state indicator (green/yellow/red) with latency readout on every robot card |
| E-Stop button looks like other buttons | Operator cannot find E-Stop in emergency | E-Stop is always visible, red, large, never in a menu or scroll area |
| Map auto-centers on robot continuously | Operator loses spatial context when planning | Auto-center only on first load; provide "re-center" button; let operator pan freely |
| Too many panels open by default | Cognitive overload, slow initial render | Default to 3-4 essential panels; progressive disclosure for advanced telemetry |
| AI slop visual patterns | Dashboard looks generic, not defense-grade | Enforce design tokens (OKLCH), 2-weight typography (400/600), no gradient buttons, no rounded-2xl cards |

## AI Agent Anti-Patterns ("AI Slop" Prevention)

These patterns emerge specifically when AI agents build UI without design system enforcement:

| Pattern | What It Looks Like | Prevention |
|---------|--------------------|------------|
| Gratuitous gradients | Every button and card has a gradient background | Flat colors only; gradients reserved for data visualization heat maps |
| Excessive border-radius | `rounded-2xl` on everything, bubbly aesthetic | Use `rounded-sm` (2px) for defense aesthetic; sharp corners = professional |
| Emoji in UI text | Section headers with emoji prefixes | Zero tolerance; strip in linting or code review |
| Generic placeholder content | "Welcome to your dashboard!" hero text | No placeholder copy; real labels from day one |
| Inconsistent spacing | Different padding on every component | Use spacing scale tokens (4px increments); lint for arbitrary values |
| Shadow stacking | `shadow-lg` on cards inside `shadow-md` containers | One shadow level per depth tier; use border instead of shadow where possible |
| Color inconsistency across phases | Phase 3 uses blue, Phase 5 uses different blue | All colors from OKLCH design tokens; never use raw hex/rgb values |
| Over-animated transitions | 300ms ease-in-out on every state change | Transitions only on layout shifts and navigation; 150ms max; `prefers-reduced-motion` respected |

## "Looks Done But Isn't" Checklist

- [ ] **WebSocket reconnection:** Unplug network for 10 seconds, replug -- does data resume without page reload?
- [ ] **Theme persistence:** Reload the page -- does the selected theme survive? Check `<html data-theme>` attribute, not just store state.
- [ ] **Layout persistence:** Rearrange panels, reload -- are positions restored? Check localStorage key matches current robot ID.
- [ ] **Router deep links:** Paste `/robot/robot-1` directly in browser -- does it load correctly, or does it 404/flash?
- [ ] **Canvas cleanup:** Navigate away from map view 20 times -- does memory usage return to baseline each time?
- [ ] **E-Stop reachability:** In every view (fleet, robot, immersive) -- is E-Stop accessible within 1 click?
- [ ] **Multi-robot isolation:** Connect 2 robots -- does controlling Robot A affect Robot B's telemetry display?
- [ ] **Mobile responsiveness:** Load on 375px width -- do panels stack correctly without horizontal scroll?
- [ ] **Empty states:** No robots connected -- does the fleet view show a helpful message, or a blank void?
- [ ] **Error boundaries:** Corrupt a ROS message format -- does one panel crash take down the whole app, or just that panel?
- [ ] **Stale data indicators:** Disconnect one topic -- does the affected panel show "stale" within 5 seconds?
- [ ] **Light theme:** Toggle to light -- are all panels readable, or do some have invisible text from hardcoded dark colors?

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Zombie RxJS subscriptions | LOW | Add subscription tracking to service layer; add cleanup in existing `useEffect` returns |
| Tests pass, app broken | MEDIUM | Add Playwright smoke tests; requires reviewing all existing test assumptions |
| Features built but not wired | MEDIUM | Audit all component imports; wire into views; add route-level Playwright tests |
| Theme not applied to root | LOW | One-line fix in `index.html` + Playwright assertion to prevent regression |
| rowHeight infinite loop | LOW | Replace dynamic calculation with `window.innerHeight` / static values (known fix from ISS-008) |
| No reconnection handling | HIGH | Requires refactoring the entire connection layer to add subscription registry |
| Canvas memory leak | MEDIUM | Add cleanup to `useEffect`; may need to refactor canvas components to use refs properly |
| AI slop in UI design | HIGH | Requires design system enforcement, visual audit process, possibly redesign affected components |
| roslib CJS build failure | LOW | Single config line in `vite.config.ts`; caught instantly by build |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| roslib CJS / ESM import | Scaffolding | Smoke test: `new ROSLIB.Ros()` compiles and runs |
| React 19 library compat | Scaffolding | Smoke test: Recharts chart + RGL grid render |
| Theme not on HTML root | Design system | `page.locator('html').toHaveAttribute('data-theme')` |
| AI slop visual patterns | Every visual phase | Screenshot scoring (AI Slop, Defense Aesthetic, Polish) |
| rowHeight infinite loop | Layout/shell | Playwright resize to 375px; assert `document.body.scrollHeight < 3000` |
| WidthProvider layout thrashing | Layout/shell | Resize sidebar in Playwright; verify grid width matches container |
| RxJS zombie subscriptions | Data layer | Dev-mode subscription counter; memory profiling over 5-minute session |
| High-frequency re-render cascade | Data layer | React Profiler: <30 renders/sec on any telemetry component |
| roslib reconnection + re-subscribe | Data layer | Playwright: disconnect/reconnect mock WebSocket, verify data resumes |
| WebSocket zombie connections | Data layer | Heartbeat test: block pings, verify "degraded" indicator in <15s |
| Canvas lifecycle leaks | Map/visualization | Memory profiling before and after 20 navigation cycles |
| Features not wired into views | Every phase (gate) | Playwright: navigate to route, assert component content is visible |
| Tests pass, app broken | Every phase (gate) | Screenshot produced and reviewed at every visual phase |
| onLayoutChange race condition | Layout/shell | Reset layout in Playwright test, verify sizes match defaults |

## Sources

### Internal Post-Mortems
- v1 post-mortem: Context provider sprawl, 52 console.logs, zero tests (`memories/decisions/v1-problems.md`)
- v2 bugs and gotchas: ISS-008 infinite loop, overnight integration gap, barrel file bloat (`memories/bugs-gotchas/v2-bugs-and-gotchas.md`)
- v3 Phase 8 post-mortem: 468 tests pass, blank screen (`memories/bugs-gotchas/v2-bugs-and-gotchas.md`)

### External Sources
- [roslibjs Issue #246: Topics don't support reconnect](https://github.com/RobotWebTools/roslibjs/issues/246)
- [roslibjs Issue #379: Handling reconnects with TFClient](https://github.com/RobotWebTools/roslibjs/issues/379)
- [WebSocket Reconnection: State Sync and Recovery Guide](https://websocket.org/guides/reconnection/)
- [Robust WebSocket Reconnection Strategies with Exponential Backoff](https://dev.to/hexshift/robust-websocket-reconnection-strategies-in-javascript-with-exponential-backoff-40n1)
- [RxJS Troubleshooting at Scale: Memory Leaks, Stream Conflicts](https://www.mindfulchase.com/explore/troubleshooting-tips/frameworks-and-libraries/rxjs-troubleshooting-at-scale-memory-leaks,-stream-conflicts,-and-performance-pitfalls.html)
- [react-grid-layout Issue #2176: Resize updates lost on React 18](https://github.com/react-grid-layout/react-grid-layout/issues/2176)
- [react-grid-layout Issue #2008: Performance with large SVG elements](https://github.com/react-grid-layout/react-grid-layout/issues/2008)
- [Optimizing React State for High-Frequency Data Streams](https://www.wellally.tech/blog/optimizing-react-state-wearable-data-streams)
- [Recharts React 19 issue](https://github.com/recharts/recharts/issues/4558)
- [Are bugs and incidents inevitable with AI coding agents?](https://stackoverflow.blog/2026/01/28/are-bugs-and-incidents-inevitable-with-ai-coding-agents/)
- [The End of AI Slop: UI/UX Pro Max](https://medium.com/@abhinav.dobhal/the-end-of-ai-slop-how-ui-ux-pro-max-is-solving-the-design-crisis-in-ai-generated-code-bbc23995f0e0)

---
*Pitfalls research for: Robot Telemetry Dashboard v4*
*Researched: 2026-03-22*
