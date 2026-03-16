# Overnight Build Summary — 2026-03-16

## Status: In Progress (4/12 phases complete)

### Branch: `EPIC/v2-rebuild`

---

## Completed Phases

### Phase 1: Foundation & Scaffold ✓
**Commit:** `1fbdf1d`
- Wiped v1 src/ completely — clean slate
- Vite 7 + @vitejs/plugin-react v5.2 + Tailwind CSS v4
- Zustand v5, RxJS 7.8, React Router v7
- Vitest v4 + Playwright configured
- ESLint 9 flat config, Prettier, Husky
- Scalable folder structure: features/, stores/, services/, views/, types/
- **64 tests passing**

**Blocker resolved:** Vite 8 incompatible with @tailwindcss/vite → stayed on Vite 7

### Phase 2: Design System ✓
**Commit:** `d303732`
- Defense-contractor OKLCH palette (dark charcoal + electric cerulean blue)
- Dual-layer CSS: `:root` for shadcn + `@theme inline` for Tailwind utilities
- Inter (sans) + IBM Plex Mono (mono) typography
- 10 shadcn/ui components installed and themed
- 3 custom components: StatusIndicator, DataCard, LoadingSpinner
- **94 tests passing** (+30 component tests)

### Phase 3: ROS Communication Layer ✓
**Commit:** `192a1c2`
- RosTransport: Per-robot ROSLIB.Ros wrapper with BehaviorSubject state
- Auto-reconnect: 3 attempts, 3s interval, Zustand bridge
- TopicSubscriber: RxJS Observable with shareReplay(refCount:true), throttleTime
- TopicPublisher: Typed publish with advertise/unadvertise lifecycle
- TopicDiscovery: One-shot Observable wrapping ros.getTopics
- RosServiceRegistry: Per-robot transport manager
- ros.store extended with topics support
- **169 tests passing** (+75 service tests)

### Phase 4: WebRTC Video Layer ✓
**Commit:** `7763944`
- SignalingClient: REST SDP exchange with AbortController timeout
- WebRTCTransport: RTCPeerConnection lifecycle, exponential backoff (2s/4s/8s)
- Generation counter for stale-async-callback prevention
- WebRTCServiceRegistry: Per-robot transport manager
- VideoFeed component: <video> with srcObject binding, status overlay
- **260 tests passing** (+91 WebRTC tests)

---

## Decisions Made Overnight

| Decision | Rationale |
|----------|-----------|
| Stay on Vite 7 (not 8) | @tailwindcss/vite doesn't support Vite 8 yet (merged but unreleased) |
| @vitejs/plugin-react v5.2 (not v6) | v6 requires Vite 8 |
| `src/types/` for shared types | Research: Grafana/Total TypeScript hybrid approach beats @types or fully colocated |
| `ComponentName.types.ts` for component types | Community standard over `definitions.ts` (non-standard) |
| OKLCH color space throughout | Perceptually uniform, defense industry standard for status colors |
| `:root` + `@theme inline` dual-layer | Only way to satisfy both shadcn variables and Tailwind v4 utilities |
| Per-robot service instances | RosServiceRegistry/WebRTCServiceRegistry with Map<robotId, Transport> |
| RxJS in service layer, NOT in Zustand | Keeps stores serializable, streams are event infrastructure not state |
| High-freq data → useObservable directly | IMU/LiDAR bypass Zustand (would cause excessive re-renders) |
| Low-freq state → Zustand bridge | Connection state, topics, errors go through Zustand for React |
| Generation counter for WebRTC | Prevents stale async callbacks from superseded connection attempts |
| Exponential backoff for WebRTC | 2s initial, doubles each retry, capped at 30s, 3 max attempts |
| ISA-101 status colors | Green nominal, amber degraded, red critical, gray offline (defense standard) |

---

## Test Summary

| Phase | Test Files | Tests | Status |
|-------|-----------|-------|--------|
| Phase 1 (Stores) | 5 | 64 | ✓ All passing |
| Phase 2 (Components) | 3 | 30 | ✓ All passing |
| Phase 3 (ROS Services) | 5 | 75 | ✓ All passing |
| Phase 4 (WebRTC Services) | 4 | 91 | ✓ All passing |
| **Total** | **17** | **260** | **✓ All passing** |

---

## Remaining Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 5. Panel System | Not started | Grid drag & drop, layout persistence |
| 6. Telemetry Widgets | Not started | IMU, LiDAR, plotting, depth camera |
| 7. Robot Control | Not started | Button controls, velocity, e-stop |
| 8. FPOV Pilot Mode | Not started | Split-view pilot station, HUD |
| 9. Multi-Robot & Fleet | Not started | Simultaneous control, fleet overview |
| 10. SLAM Map | Not started | OccupancyGrid Canvas 2D renderer |
| 11. Data Recording | Not started | RxJS recording, IndexedDB, export |
| 12. Integration & Polish | Not started | E2E testing, deployment |

---

## How to Review

```bash
# Switch to the rebuild branch
git checkout EPIC/v2-rebuild

# See all commits
git log --oneline

# Run tests
npm test

# Start dev server
npm run dev

# Build for production
npm run build
```

*Generated: 2026-03-16 overnight autonomous build session*
