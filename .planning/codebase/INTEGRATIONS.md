# External Integrations

**Analysis Date:** 2026-03-15

## APIs & External Services

**ROS Bridge Suite (rosbridge_websocket):**
- Primary robot communication channel via WebSocket
  - Client: roslib 1.4.1 (`src/hooks/ros/useRos.ts`)
  - Configuration: `src/config/ros.ts` (CONNECTION_CONFIG)
  - Connection management: `src/contexts/ros/RosContext.tsx`
  - Auth: None (direct WebSocket connection)
  - Protocol: ws:// or wss:// to `/rosbridge` path
  - Auto-reconnect: 3 attempts at 3-second intervals

**WebRTC Signaling Server (aiortc-based):**
- Low-latency video streaming from robot cameras
  - Client: Custom signaling client (`src/lib/webrtc/signaling.ts`)
  - Hook: `src/hooks/webrtc/useWebRTC.ts`
  - Configuration: `src/config/webrtc.ts`
  - Auth: None (REST-based SDP offer/answer exchange)
  - Endpoint: HTTP POST to `/offer` on robot's WebRTC server
  - Auto-reconnect: 3 attempts with exponential backoff (2s-30s)

**Google STUN Servers (NAT traversal):**
- Used by WebRTC for peer-to-peer connection establishment
  - `stun:stun.l.google.com:19302`
  - `stun:stun1.l.google.com:19302`
  - `stun:stun2.l.google.com:19302`
  - `stun:stun3.l.google.com:19302`
  - Config: `src/config/webrtc.ts` in `DEFAULT_ICE_SERVERS`

## Data Storage

**Databases:**
- None (frontend-only application)

**File Storage:**
- None

**Caching:**
- Browser localStorage for:
  - Robot connections list (base URLs, names) - `src/contexts/ros/RosContext.tsx`
  - Active robot selection - `src/contexts/ros/RosContext.tsx`
  - Theme preference - `src/components/ThemeProvider.tsx`

## Authentication & Identity

**Auth Provider:**
- None (no user authentication)
- Direct connection to robot infrastructure

## Monitoring & Observability

**Error Tracking:**
- None (console.error/console.warn only)

**Analytics:**
- None

**Logs:**
- Browser console only (extensive in WebRTC and ROS hooks)
- Sonner toast notifications for user-facing errors (`src/hooks/ros/useRos.ts`)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages - Static site hosting
  - Base path: `/robot-telemetry-dashboard/` (`vite.config.ts`)
  - Deployment: Manual or GitHub Actions

**CI Pipeline:**
- `.github/workflows/` directory exists
- Pre-commit hooks via Husky + lint-staged

## ROS Message Types Handled

**Subscribed Topics (Robot -> Dashboard):**
- `sensor_msgs/msg/LaserScan` - LiDAR data (`src/components/telemetry/lidar/LidarCard.tsx`)
- `sensor_msgs/msg/Imu` - IMU telemetry (`src/components/telemetry/imu/IMUCard.tsx`)
- `sensor_msgs/CompressedImage` / `sensor_msgs/Image` - Camera feeds (`src/components/video/`)
- `nav_msgs/Odometry` - Odometry data (topic discovery supported)
- `sensor_msgs/BatteryState` - Battery status

**Published Topics (Dashboard -> Robot):**
- `geometry_msgs/Twist` - Movement commands to `/cmd_vel` (`src/contexts/control/ControlContext.tsx`)

## Communication Protocols

- **WebSocket** (ws:// / wss://) - rosbridge connection for telemetry and commands
- **WebRTC** - Peer-to-peer video with REST-based signaling
- **HTTP/REST** - WebRTC offer/answer exchange (`src/lib/webrtc/signaling.ts`)

## Robot-Side Infrastructure (Documented, Not in Repo)

- **Nginx reverse proxy** - Multiplexes rosbridge (9090) and WebRTC (8080) on single port 8000
  - Documentation: `ROBOT_NGINX_SETUP.md`
- **ngrok tunneling** (optional) - Secure remote access
  - Documentation: `README.md` "Remote Access with ngrok" section
- **ROS2 Humble** on Ubuntu 22.04
- **rosbridge_suite** WebSocket server
- **Custom WebRTC server** (Python aiortc)

## Environment Configuration

**Development:**
- No env vars required
- Robot URL configured via UI at runtime
- Works with local or remote robots

**Production:**
- Static deployment, no server-side configuration
- Robot URLs stored in user's browser localStorage

## Not Detected

- Payment processing
- External authentication providers
- Third-party analytics
- CDN services
- Database backends
- API gateways
- Message brokers

---

*Integration audit: 2026-03-15*
*Update when adding/removing external services*
