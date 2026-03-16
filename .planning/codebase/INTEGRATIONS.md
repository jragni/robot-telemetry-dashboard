# External Integrations

**Analysis Date:** 2026-03-16

## APIs & External Services

**ROS Bridge (Robot Operating System):**

- roslib 1.4.1 - WebSocket communication with ROS2 robots
  - SDK/Client: roslib npm package + `@types/roslib`
  - Auth: None (direct WebSocket connection on local network)
  - Connection: `ws://{robotBaseUrl}/rosbridge` endpoint
  - Config: `src/config/ros.ts` (3000ms reconnect, 10000ms timeout, 3 retries)
  - Services:
    - `src/services/ros/RosTransport.ts` - Connection lifecycle with auto-reconnect
    - `src/services/ros/TopicSubscriber.ts` - RxJS Observable wrapper for topic subscription
    - `src/services/ros/TopicPublisher.ts` - Publish Twist/control messages
    - `src/services/ros/TopicDiscovery.ts` - Query available ROS topics
    - `src/services/ros/RosServiceRegistry.ts` - Per-robot transport singleton manager

**WebRTC (Video Streaming):**

- Native WebRTC API - Peer-to-peer video from robot cameras
  - SDK/Client: Browser RTCPeerConnection API
  - Auth: None
  - Signaling: Custom SDP exchange via `src/services/webrtc/SignalingClient.ts`
  - Config: `src/config/webrtc.ts` (3 reconnects, 2s initial backoff, 30s max backoff, 15s timeout)
  - Services:
    - `src/services/webrtc/WebRTCTransport.ts` - Peer connection lifecycle with exponential backoff
    - `src/services/webrtc/SignalingClient.ts` - REST SDP offer/answer negotiation
    - `src/services/webrtc/WebRTCServiceRegistry.ts` - Per-robot transport singleton manager

## Data Storage

**Databases:**

- IndexedDB (browser) - Recording session storage
  - Database: `rtd-recordings` (version 1)
  - Object stores: `sessions` (metadata), `messages` (recorded topic data)
  - Indexes: `sessionId`, `topicName`
  - Service: `src/features/recording/recording.service.ts`
  - Types: `src/features/recording/recording.types.ts`

**Persistent State:**

- Browser localStorage - UI state persistence
  - Keys defined in `src/config/constants.ts`:
    - `rtd-robots` - Saved robot connections
    - `rtd-active-robot` - Currently selected robot
    - `rtd-theme` - Dark/light theme preference
    - `rtd-panel-layouts` - Dashboard panel arrangements

**File Storage:**

- Not applicable (no server-side storage)

**Caching:**

- Not applicable

## Authentication & Identity

**Auth Provider:**

- None - Direct-connect model, no login system
- Explicitly out of scope per PROJECT.md

## Monitoring & Observability

**Error Tracking:**

- None (no Sentry, Datadog, etc.)

**Analytics:**

- None (no Mixpanel, Segment, etc.)

**Logs:**

- Custom structured logger: `src/lib/logger.ts`
  - Module-prefixed log messages with timestamps
  - Environment-based log levels

## CI/CD & Deployment

**Hosting:**

- GitHub Pages - Static site deployment
  - Base path: `/robot-telemetry-dashboard/`
  - Source: Vite production build

**CI Pipeline:**

- `npm run ci` script: lint → type check → test → build
- Pre-commit hooks via Husky + lint-staged (eslint --fix, prettier --write)

## External Network Dependencies

**Google STUN Servers** (standard WebRTC requirement):

- stun.l.google.com:19302
- stun1.l.google.com:19302
- stun2.l.google.com:19302
- stun3.l.google.com:19302
- stun4.l.google.com:19302
- Config: `src/config/webrtc.ts`

## Environment Configuration

**Development:**

- No environment variables required
- No .env files present
- All configuration hardcoded in `src/config/`
- Robot connections added at runtime via UI

**Production:**

- Same as development (static SPA)
- Robots connect via user-provided base URLs in the dashboard

## Webhooks & Callbacks

**Incoming:**

- None

**Outgoing:**

- None

---

_Integration audit: 2026-03-16_
_Update when adding/removing external services_
