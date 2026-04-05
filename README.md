# Robot Telemetry Dashboard

A real-time web dashboard for monitoring and controlling ROS2-enabled robots. Connects via WebSocket (rosbridge) for telemetry and commands, with WebRTC video streaming for low-latency camera feeds.

## Features

### Real-Time Sensor Visualization
- **LiDAR** — Canvas 2D tactical display with robot-frame orientation (X=forward, Y=left), zoom controls, distance labels
- **IMU Attitude** — Quaternion-to-Euler conversion with compass, attitude indicator, numbers, and 3D wireframe views
- **Telemetry Graphing** — Multi-topic time-series plotting supporting Odometry, Twist, IMU, BatteryState, and LaserScan
- **Camera** — WebRTC video stream via aiortc REST signaling
- **System Status** — Live ROS computation graph (nodes, topics, services, actions) with expandable name lists

### Robot Control
- D-pad directional control with configurable linear/angular velocity
- Keyboard arrow key support
- Emergency stop
- Real-time `geometry_msgs/msg/Twist` publishing to `/cmd_vel` via roslib
- Pilot Mode — fullscreen FPV view with HUD overlays

### Connection Management
- Multi-robot support with persistent connection store
- Connection test before adding robots
- Auto-reconnection with exponential backoff (2s → 30s cap, 5 attempts)
- Toast notifications for connection state transitions
- Per-robot topic selection shared between Workspace and Pilot views

### Interface
- Midnight Operations dark theme (OKLCH hue 260)
- Triple-redundant status indicators (color + icon + text per MIL-STD-1472H)
- 6-panel workspace with minimize/maximize
- Responsive fleet card grid with connect/disconnect/delete
- Topic dropdowns filtered by compatible ROS message types per panel

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19, TypeScript 5.9, Vite 7 |
| **Styling** | Tailwind CSS v4, shadcn/ui (Radix), Lucide React |
| **Fonts** | Exo (UI) + Roboto Mono (telemetry data) |
| **State** | Zustand with localStorage persistence |
| **ROS Bridge** | roslib 2.x (pure ESM) via WebSocket |
| **Video** | WebRTC with aiortc REST signaling |
| **Validation** | Zod v4 |
| **Notifications** | Sonner |
| **Quality** | ESLint, TypeScript strict, eslint-plugin-boundaries (3-tier) |

## Architecture

```
┌─────────────────────────────────────────┐
│  Robot (ROS2)                           │
│  nginx reverse proxy (:8000)            │
│    /rosbridge → rosbridge_server (9090) │
│    /webrtc    → aiortc signaling (8080) │
└──────────────────┬──────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
 roslib        WebRTC        REST API
 Topics      PeerConn       SDP offer
    │              │              │
    ▼              ▼              ▼
┌─────────────────────────────────────────┐
│  Dashboard (Browser)                    │
│                                         │
│  ConnectionManager ← module singleton   │
│    └→ Map<robotId, Ros>                 │
│                                         │
│  Zustand Store ← serializable state     │
│    └→ robots, status, selectedTopics    │
│                                         │
│  React Hooks ← per-panel subscriptions  │
│    └→ useRosSubscriber, useRosGraph,    │
│       useLidarSubscription, useImu...   │
│                                         │
│  Components ← Canvas 2D + shadcn/ui    │
└─────────────────────────────────────────┘
```

**Three-layer data flow:**
1. **ConnectionManager** (module singleton) — holds live Ros instances, pushes status to store
2. **Zustand Store** — serializable UI state, persisted to localStorage
3. **React Components** — read store via selectors, subscribe to topics via hooks

## Prerequisites

**Web Application:** Node.js 18+, npm

**Robot System:** Ubuntu 22.04+, ROS2 Humble, Python 3.10+, camera (USB/CSI) (TurtleBot 3 used)

## Quick Start

```bash
git clone https://github.com/jragni/robot-telemetry-dashboard.git
cd robot-telemetry-dashboard
npm install
npm run dev
```

Open `http://localhost:5173`. Click **Add Robot**, enter the robot's base URL.

## Robot Setup

### 1. Install ROS Bridge Server

```bash
# Install rosbridge_server
sudo apt install ros-${ROS_DISTRO}-rosbridge-server

# Or build from source
cd ~/ros2_ws/src
git clone https://github.com/RobotWebTools/rosbridge_suite.git
cd ~/ros2_ws && colcon build --packages-select rosbridge_server
```

Launch rosbridge:
```bash
source ~/ros2_ws/install/setup.bash
ros2 launch rosbridge_server rosbridge_websocket.launch.xml
# Default port: 9090
```

### 2. WebRTC Video Streaming

For low-latency camera streaming, use the companion WebRTC server:

**[github.com/jragni/ros-webrtc](https://github.com/jragni/ros-webrtc)** — lightweight Python-based WebRTC streaming using aiortc.

Follow the installation instructions in that repository. Default port: 8080.

### 3. Configure Nginx Reverse Proxy

Nginx consolidates rosbridge and WebRTC behind a single port so the dashboard only needs one base URL.

```bash
sudo apt update && sudo apt install nginx
sudo vim /etc/nginx/sites-available/robot-teleop
```

Add this configuration:
```nginx
server {
    listen 8000;
    server_name _;

    # WebSocket for rosbridge
    location /rosbridge {
        rewrite ^/rosbridge/?(.*)$ /$1 break;
        proxy_pass http://localhost:9090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    # WebRTC signaling server
    location /webrtc/ {
        rewrite ^/webrtc/?(.*)$ /$1 break;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and start:
```bash
sudo ln -s /etc/nginx/sites-available/robot-teleop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Your robot is now accessible at:
- Rosbridge: `ws://<robot-ip>:8000/rosbridge`
- WebRTC: `http://<robot-ip>:8000/webrtc/`

### 4. Remote Access (optional)

For accessing the robot over the internet. Two options:

#### Cloudflare Tunnel (recommended)

Free, no bandwidth limits, reliable TLS, no account needed for quick tunnels.

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb

# Start a quick tunnel (URL changes on restart)
cloudflared tunnel --url http://127.0.0.1:8000
```

Use the Cloudflare URL in the dashboard:
```
cloudflared gives:  https://random-words.trycloudflare.com
dashboard:          https://random-words.trycloudflare.com
```

For a stable URL that persists across restarts, set up a [named tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) with a Cloudflare account (free).

Each robot runs its own `cloudflared` process independently. Quick tunnels require no login and have no limit on concurrent tunnels.

#### ngrok (alternative)

```bash
sudo apt install ngrok
ngrok config add-authtoken YOUR_AUTHTOKEN
ngrok http 8000
```

Use the ngrok URL in the dashboard:
```
ngrok gives:  https://abc123.ngrok-free.app
dashboard:    wss://abc123.ngrok-free.app
```

**Note:** ngrok `.dev` subdomains may have TLS issues due to HSTS preloading. If you encounter `ERR_SSL_PROTOCOL_ERROR`, switch to Cloudflare Tunnel.

## Connection Format

Enter the base URL only — the dashboard appends `/rosbridge` and `/webrtc` automatically:
- **Local:** `ws://192.168.1.100:8000`
- **Cloudflare:** `https://random-words.trycloudflare.com`
- **ngrok:** `wss://abc123.ngrok-free.app`

## Supported ROS Message Types

| Type | Topic Example | Used By |
|------|--------------|---------|
| `sensor_msgs/msg/LaserScan` | `/scan` | LiDAR panel |
| `sensor_msgs/msg/Imu` | `/imu/data` | IMU panel, Telemetry |
| `sensor_msgs/msg/BatteryState` | `/battery` | System Status, Fleet cards |
| `nav_msgs/msg/Odometry` | `/odom` | Telemetry panel |
| `geometry_msgs/msg/Twist` | `/cmd_vel` | Controls (publish) |
| `sensor_msgs/msg/CompressedImage` | `/camera/image_raw/compressed` | Camera (via WebRTC) |

## Development

```bash
npm run dev          # Dev server with HMR
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check
```

## License

MIT
