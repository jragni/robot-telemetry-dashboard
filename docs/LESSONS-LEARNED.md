# Lessons Learned

Hard-won knowledge from building the Robot Telemetry Dashboard across v1 through v4. Each lesson came from a real failure, not theory.

---

## Connectivity & Tunneling

### rosbridge serializes NaN/Infinity as null
JSON has no `NaN` or `Infinity` literals. rosbridge converts them to `null` when serializing ROS messages to JSON over WebSocket. Real LiDAR sensors send these for invalid readings in `ranges` and `intensities` arrays.

**Impact:** Zod schemas written against the ROS message spec (`z.array(z.number())`) rejected every single LiDAR message. Zero points rendered despite the robot publishing valid data.

**Fix:** Use `z.number().nullable()` on numeric array fields. Add null guards in post-parse filters. Always validate schemas against `ros2 topic echo` output from a real robot, not just the interface spec.

### rosbridge JSON inflates bandwidth 5x
rosbridge serializes float32 arrays as JSON text. A 4-byte float becomes `0.12345678` (10+ bytes). IMU at 100Hz through rosbridge = ~250KB/s per robot. Four robots through ngrok consumed ~1GB in 2 hours.

**Quick wins:** `throttle_rate` parameter on ROSLIB.Topic (server-side throttling, not just client-side RAF). `compression: 'cbor'` for binary encoding. Combined: 85-95% bandwidth reduction.

**Medium-term:** foxglove_bridge (binary CDR protocol, drop-in replacement, 60-70% reduction over rosbridge JSON).

**Long-term:** WebRTC DataChannels (P2P, no tunnel needed, unifies camera + telemetry + commands).

### RAF throttle is rendering-only
`requestAnimationFrame` throttling only reduces how often React state updates and the canvas redraws. It does NOT reduce wire bandwidth — the WebSocket still receives every message at the source rate. Server-side `throttle_rate` is the actual bandwidth fix.

### ngrok .dev domains break due to HSTS
The `.dev` TLD is on the browser HSTS preload list (owned by Google). All browsers require valid TLS for `.dev` domains with zero exceptions. If ngrok's TLS cert provisioning has any delay, the browser hard-rejects with `ERR_SSL_PROTOCOL_ERROR` — no bypass possible.

**Impact:** Paid ngrok plan assigned a `.ngrok-free.dev` subdomain. TLS cert provisioning lagged. Every browser on every device showed SSL errors. The tunnel was actually functional (ngrok dashboard showed 200 responses) but no browser could establish the TLS handshake.

**Fix:** Switched to Cloudflare Tunnel (free, reliable TLS, no interstitial pages). Quick tunnel: `cloudflared tunnel --url http://127.0.0.1:8000`. Named tunnel for stable URLs with a custom domain.

### Mixed content blocks ws:// from HTTPS pages
GitHub Pages serves over HTTPS. Browsers block insecure WebSocket (`ws://`) connections from secure pages. You must use `wss://` which requires a TLS-terminating proxy (ngrok, Cloudflare Tunnel, or your own cert).

### Cloudflare Tunnel is the better option
Free tier: 2 active tunnels, no bandwidth cap (low volume expected), full WebSocket support, no interstitial pages, works on arm64 (Raspberry Pi). Named tunnels give stable URLs with auto-start via systemd. Quick tunnels for development, named tunnels for production.

---

## ROS Integration

### Validate schemas against real robot data
The ROS 2 interface spec says `float32[] ranges`. The actual JSON over rosbridge says `[1.0, null, 3.0, null]`. Writing schemas from the spec without testing against real data produces code that compiles, passes all tests, and silently rejects every message at runtime.

**Rule:** Run `ros2 topic echo <topic>` on a real robot. Copy actual message output. Test your Zod schema against it.

### Battery percentage has two scales
Some ROS battery publishers report percentage as 0-1 (fraction), others as 0-100 (percent). The subscription hook must detect and normalize: if value > 1, treat as 0-100; if <= 1, multiply by 100.

### LiDAR coordinate frame mapping
ROS LiDAR: X = forward, Y = left. Screen: X = right, Y = down. The angle-to-pixel conversion must flip axes: `screenX = cx - sin(angle) * distance * scale`, `screenY = cy - cos(angle) * distance * scale`.

### roslib 2.x is pure ESM
No default export. Use `import { Ros, Topic } from 'roslib'`. Has no built-in reconnection — you must implement exponential backoff yourself. Does have built-in re-subscription after reconnect.

### Create Ros() without URL, then connect()
If you pass the URL to the constructor, the connection starts immediately before event listeners are attached. Create the instance first, attach `connection`/`error`/`close` listeners, then call `connect(url)`.

---

## React & Canvas Performance

### React shallow equality and mutable refs
Passing a mutable array reference as state (`data: buf`) means React's shallow comparison sees the same reference and skips re-rendering. The canvas never redraws even though the array contents changed.

**Impact:** Telemetry panel showed zero plots despite data arriving. The "optimization" of removing `[...buf]` (spread copy) broke rendering entirely.

**Fix:** State values must be new references to trigger re-renders. Either spread-copy (`data: [...buf]`) or use a ref + version counter pattern.

### SVG re-renders full subtree at 10-20Hz
Recharts (SVG-based) re-renders the entire chart DOM on every data update. At telemetry rates (10-20Hz), this creates thousands of DOM mutations per second. Canvas 2D with a ring buffer + RAF loop is the correct approach for real-time telemetry.

### Canvas cannot resolve CSS variables directly
`ctx.fillStyle = 'var(--color-accent)'` does not work. You must call `getComputedStyle(element).getPropertyValue('--color-accent')` to resolve the actual color value, then pass that to the canvas context.

### Canvas theme redraw requires a version counter
After a theme switch, canvas components must re-resolve CSS variables and redraw. A `themeVersion` state counter (incremented by a MutationObserver on the `data-theme` attribute) triggers useCallback recreation with fresh colors.

### Math.min(...spread) stack overflows on large arrays
`Math.min(...points.map(p => p.distance))` with 2000+ LiDAR points exceeds the call stack limit. Use a for-loop instead.

### Dynamic rowHeight causes infinite layout loops
Computing grid row height from container height creates a feedback loop: height changes trigger layout, layout changes height. Use `window.innerHeight` for large screens, static values for medium/small.

---

## Architecture

### No React Context for shared state
Zustand with selectors replaces all Context usage. Context causes full subtree re-renders when any value changes. Zustand selectors only re-render when the selected slice changes.

### Panels own their subscriptions
Each workspace panel subscribes to its own ROS topics directly (via hooks), not through Context or prop relay. Hidden/minimized panels unsubscribe, saving bandwidth. The rejected alternative (T-021) tried to centralize subscriptions in Context — this was rejected because it couples all panels to one provider and prevents per-panel bandwidth optimization.

### Three-tier import boundaries
`src/stores/`, `src/hooks/`, `src/utils/`, `src/lib/`, `src/types/` (shared layer) cannot import from `src/features/`. Features can import from shared. App layer can import from everything. Enforced by eslint-plugin-boundaries. Violations are caught by a regression test that greps shared-layer files for `@/features/` imports.

### No barrel files
Barrel files (`index.ts` re-exporting everything) cause 68% module bloat because bundlers pull entire module trees. Import directly from source files. This is ADR-001.

---

## Process & Automation

### Sequential agent dispatch, not parallel
Parallel agents sharing a working directory corrupt each other's branches — leaked commits, git lock files, wrong-branch commits. Wave 1 had a 50% failure rate from this. Wave 2 switched to sequential dispatch (one agent at a time) and had zero failures across 20 PRs.

### Every PR must include tests
Code-only PRs shipped the ring buffer regression (T-034) and the LiDAR null schema bug (both from the overnight build). The new rule: if you change behavior, add or update tests covering that behavior. Test-only PRs for backfilling coverage are fine standalone.

### Review before merge is non-negotiable
Three Wave 1 PRs were merged before their review agents reported back. One had a real issue (indentation bug). The pipeline is: execute → review → respond to feedback → merge. Skipping review is how bugs ship.

### Acceptance criteria must be semantic, not structural
The v4 overnight build passed all structural checks (93 files had `var(--` syntax) but failed visually (6.2/10 score) because the token names were fabricated. `--color-surface-raised` doesn't exist in the design system but passes a regex check for `var(--color-`. Acceptance criteria must verify specific token names, not just patterns.

### Visual work cannot be delegated to subagents
Subagents cannot invoke `/frontend-design` or `ui-ux-pro-max` skills. The Phase 12.2 failure shipped "horrendous" light-mode rendering because all visual work was delegated. Result: 147 commits (29K lines) fully reverted. Visual phases must execute inline in the main context with rendered output verification.

### Always gitignore before creating files with secrets
A 21st.dev API key was committed in `.mcp.json` because the file was created before `.gitignore` was updated. Required git-filter-repo to remove from history. Prevention: add the gitignore entry first, then create the file.

### lint-staged can revert unstaged changes
lint-staged stashes unstaged changes during pre-commit hooks. If a modified file isn't staged, it gets reverted to HEAD after the commit. Lost minimize/maximize wiring and LiDAR integration twice before discovering this.

### Container query breakpoints must fit the container
`@container (min-width: 240px)` on a container that's only 192px wide (w-48) will never trigger. Always verify the container's actual rendered width before setting breakpoint values.

---

## Design System

### Tailwind v4 two-layer theme pattern
OKLCH color values go in `:root` / `[data-theme]` as CSS custom properties. Token names are registered via `@theme inline` so Tailwind generates utility classes. Without `@theme inline`, Tailwind never sees the CSS vars and utilities like `bg-surface-base` don't generate.

### shadcn needs token compatibility
shadcn components expect `--primary`, `--destructive`, `--muted` etc. These must be mapped to your design system tokens or the components render invisible (no background, no text color). After every `shadcn add`, check that the generated component's token references resolve.

### shadcn CLI reads tsconfig.json, not tsconfig.app.json
If `tsconfig.json` lacks `compilerOptions.paths`, shadcn installs to the wrong directory. It reads paths from the root tsconfig, not the referenced app config.

### Only use existing token namespaces
Only `--color-surface-*`, `--color-text-*`, `--color-accent*`, `--color-status-*`, `--color-border*` exist. Never invent new namespaces. Autonomous agents will fabricate plausible-sounding tokens that silently fall to hardcoded fallbacks.

---

## Testing

### Tests that pass don't mean the app works
Phase 8: 468 tests passed, reviewer scored 7/8/8, screen was completely empty. Tests verified code behavior (functions return correct values) but not visual output (components actually render on screen). Tests and reviews evaluate DOM structure, not screenshots.

### Structural tests catch syntax, not semantics
A test that checks "file contains `var(--`" passes when the token name is fabricated. A test that checks "file contains `var(--color-accent)`" catches the real issue. Grep-based regression tests are valuable but must check specific values, not patterns.

### Co-locate tests next to source
Tests live next to the code they test (`MyComponent.test.tsx` next to `MyComponent.tsx`). Only create `__tests__/` subdirectories when 3+ test files exist for one module.
