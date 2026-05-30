# Manual UAT Checklist (driver-side, three-tier `dev → uat → main`)

The headless Playwright UAT (`e2e/uat/wave-merged-uat.spec.ts`) covers render + console + reflow + happy-path connect. Some behaviors only show up under a human driver — visual fidelity, actual data values, interaction feedback, long-running stability. Run this checklist against the `uat` branch tip when promoting `dev → uat → main`.

## 0. Setup

- [ ] `git checkout uat && git pull --ff-only`
- [ ] `npm ci` if dependencies changed since last UAT
- [ ] `npm run dev` (Vite — http://localhost:5173/robot-telemetry-dashboard/)
- [ ] Robot tunnel up: `curl -I https://<robot>.trycloudflare.com` returns 200 on `/` and 400 on `/rosbridge` (400 = needs WS upgrade, expected)
- [ ] DevTools open in another tab: Console + Network filtered to `error` only

## 1. Add Robot modal

- [ ] CTA visible from the fleet empty state
- [ ] Modal opens on click; Esc closes; backdrop click closes
- [ ] Rosbridge URL input does NOT auto-zoom on iOS Safari focus (test on a real device or device-mode at 375px with iOS Safari emulation)
- [ ] Pasting a URL into the field preserves the full string (no autocorrect / autocapitalize mangling)
- [ ] Mixed-content warning shows if the URL is `ws://` from an `https://` page
- [ ] Submit disables the button while testing the connection (spinner / pending state visible)
- [ ] On success: modal closes, robot card renders, status dot transitions disconnected → connecting → connected
- [ ] On a deliberately bad URL: clear error surfaced inline (not a thrown toast that disappears)

## 2. Fleet card

- [ ] Robot name + truncated URL render
- [ ] Status dot color reflects state (green connected, yellow connecting, red error)
- [ ] Battery row shows `%` when known OR `—` when unknown (NOT `0%`, NOT `-100%`)
- [ ] Last-seen timestamp updates while connected
- [ ] VIEW link navigates to `/robot/:id`
- [ ] Delete removes the card and the connection

## 3. Workspace — all 6 panels (against the live robot)

For each panel: panel header readable, content not clipped, no layout shift mid-update, no console error tied to that panel's subscription.

- [ ] **SystemStatus** — battery `%` or `—`; uptime advancing; nodes / topics / services / actions counts shown
- [ ] **IMU** — pitch / roll / yaw numbers update; wireframe cube rotates with orientation; no flicker
- [ ] **LiDAR** — minimap shows scan points; rotates with robot if it moves; no NaN-axis crash
- [ ] **Telemetry** — chart lines extend over time; X axis scrolls; multiple series with stable colors
- [ ] **Camera** — video element present; if WebRTC connects, video plays; if it doesn't, the disconnected state is clear (no infinite spinner)
- [ ] **Controls** — D-pad buttons clickable; velocity sliders move; Enter Pilot Mode button visible (or its replacement)

Telemetry sustain (5 min): leave the workspace open. Memory in DevTools should NOT grow unboundedly. Frame rate (DevTools Performance) stays at refresh cadence.

## 4. Pilot Mode

- [ ] Entry navigates to `/pilot/:id`
- [ ] PilotControls render; D-pad responsive on desktop
- [ ] Long-press on desktop PilotHud / PilotControls does NOT trigger browser zoom (touch tablet test)
- [ ] Status bar shows ROS + video status; reconnect button visible on disconnect
- [ ] LiDAR minimap renders with live scan
- [ ] Gyro readout updates with orientation
- [ ] Back / Esc / breadcrumb returns to workspace

## 5. Mobile (375 × 812) + mobile-sm (320 × 600)

Switch DevTools device toolbar.

- [ ] No page-level horizontal scrollbar
- [ ] Fleet card list scrolls vertically without overflow
- [ ] Add Robot modal goes full-screen on mobile (not a centered dialog)
- [ ] Mobile workspace renders the panel carousel; swipe between panels
- [ ] Mobile Pilot Mode HUD: D-pad reachable with thumb, no zoom on press-and-hold
- [ ] Touch targets feel ≥ 44 × 44 px (D-pad, E-STOP, sidebar items)

## 6. Reconnect under real disconnect (T-152 regression)

- [ ] With robot connected, kill the rosbridge tunnel (Ctrl-C on the cloudflared process or unplug)
- [ ] Status flips to disconnected; toast appears once (not per retry)
- [ ] Within ~10s the reconnect attempts run; UI does NOT freeze
- [ ] On manual reconnect (button) or tunnel restored: status returns to connected; data resumes
- [ ] No leaked timers / no double-fire (DevTools Performance shows one reconnect cycle per failure)

## 7. Browser-state persistence

- [ ] Refresh the page while on workspace; robot list persists (Zustand persist via localStorage)
- [ ] Browser back from pilot → workspace → fleet works without console error
- [ ] Open in a fresh incognito window: empty fleet state appears (no shared state)

## 8. Theme (if applicable)

- [ ] Theme toggle visible; switching light ↔ dark redraws canvas panels with the new palette
- [ ] No flash of unstyled content; no color-mismatched panel

## 9. Sign-off

- [ ] Console error count = 0 (excluding the IGNORED_ERROR_PATTERNS from the UAT spec)
- [ ] No Network panel errors that map to first-party origins
- [ ] Headless UAT spec also passes against the same robot URL: `UAT_ROBOT_URL=<url> npx playwright test e2e/uat/wave-merged-uat.spec.ts --workers=1`
- [ ] Sign-off note added to the `dev → uat` or `uat → main` PR with the commit SHA you tested
