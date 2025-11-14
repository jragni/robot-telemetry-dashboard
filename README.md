# Robot Telemetry Dashboard

A web-based dashboard that provides real-time visualization of sensor data and control of ROS2-enabled robots through web sockets and video streaming through WebRTC.

## Features

### Real-Time Data Visualization

- **Camera Streams**: Live video feed via WebRTC for low-latency streaming (improved from 5 fps to 30fps)
- **LiDAR Visualization**: Real-time laser scan data with 2D polar plots using D3.js
- **IMU Telemetry**: Three-axis orientation, acceleration, and angular velocity graphs
- **Topic Monitoring**: Live topic list with message counts and types

### Robot Control

- **Movement Controls**: 4-directional movement with velocity control
- **Real-Time Commands**: Prioritized command publishing via roslib for responsive control
- **Emergency Stop**: Immediate halt command
- **Pilot Mode**: Click-to-move interface with drag support

### Interface

- **Operator Layout**: Information-dense design optimized for mission-critical operations
- **Responsive Design**: Full desktop experience with mobile-optimized layouts
- **Dark Theme**: Operator-friendly dark interface with modern UI components
- **Connection Management**: Multi-robot connection support with retry logic

## Technology Stack

- **Frontend**: React 19, Vite 7, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui (Radix UI primitives)
- **Data Visualization**: D3.js v7 for charts and plots
- **Robot Communication**:
  - WebRTC for low-latency video streaming
  - ROS Bridge (roslib.js 1.4.1) via WebSocket for control and telemetry
- **UI Components**: Lucide React icons, Sonner for notifications, next-themes for theming

## Prerequisites

### Web Application

- Node.js 18+ and npm

### Robot System

- Ubuntu 22.04 LTS (recommended)
- ROS2 Humble
- Python 3.10+
- Camera (USB or CSI)
- Optional: LiDAR, IMU sensors
- 4GB+ RAM recommended

## Installation

### Web Application

```bash
# Clone the repository
git clone https://github.com/jragni/robot-telemetry-dashboard.git
cd robot-telemetry-dashboard

# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev

```

## Robot Setup

### 1. Install ROS Bridge Server

The rosbridge server enables WebSocket communication between the web dashboard and your ROS2 system.

**Installation:**

```bash
# Install rosbridge_server
sudo apt install ros-${ROS_DISTRO}-rosbridge-server

# Or build from source
cd ~/ros2_ws/src
git clone https://github.com/RobotWebTools/rosbridge_suite.git
cd ~/ros2_ws && colcon build --packages-select rosbridge_server
```

**Launch rosbridge:**

```bash
source ~/ros2_ws/install/setup.bash
ros2 launch rosbridge_server rosbridge_websocket.launch.xml
# Default port: 9090
```

### 2. Setup WebRTC Video Streaming

For low-latency video streaming, use the WebRTC server:

**Clone and setup:**

# Follow installation instructions in the repository

[https://www.github.com/jragni/ros-webrtc](https://www.github.com/jragni/ros-webrtc)

````

The ros-webrtc package provides a lightweight Python-based WebRTC streaming solution using aiortc.

### 3. Configure Nginx Reverse Proxy (on robot)

Nginx consolidates rosbridge and WebRTC endpoints for easier remote access.

**Install Nginx:**
```bash
sudo apt update
sudo apt install nginx
````

**Create configuration file:**

```bash
sudo vim /etc/nginx/sites-available/robot-teleop
```

**Add configuration:**
This setup allows you to have a single url and exposes one port that handle the websocket bridge and webrtc bridge

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

To exit and save, use command `:wq`

**Enable and start:**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/robot-teleop /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

Now you can access:

- Rosbridge: `ws://(your robot ip):8000/rosbridge`
- WebRTC signaling: `http://(your robot ip):8000/webrtc/`

### 4. Remote Access with ngrok (on robot) (Optional -ish)

For accessing your robot over the internet, use ngrok to create a secure tunnel to your nginx proxy.
I've tried using localtunnel (npm package) and it also works, but it requires an extra step where the user has to authenticate by visiting the url provided by localtunnel. ngrok is the most straight direct option. Have not tried with cloudflare.

**Install ngrok:**

````bash

# using apt
sudo apt install ngrok
# Using snap
sudo snap install ngrok


**Setup ngrok:**
```bash
# Add your authtoken (sign up at https://ngrok.com)
ngrok config add-authtoken YOUR_AUTHTOKEN

# Start tunnel to your nginx proxy (port 8000)
ngrok http 8000
````

**Output example:**

```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8000
```

**Important**: ngrok provides an `https://` URL. When connecting in the dashboard, **replace `https://` with `wss://`**:

- ngrok gives you: `https://abc123.ngrok-free.app`
- Use in dashboard: `wss://abc123.ngrok-free.app`

## Robot Configuration

### Connection Format

With the nginx setup, you only need **one URL** to connect to your robot. Nginx multiplexes both the rosbridge WebSocket (port 9090) and WebRTC signaling (port 8080) into a single port (8000) using different paths.

**Single Connection URL:**

```
Local network:
Base URL: http://192.168.1.100:8000

Remote access (via ngrok):
ngrok gives: https://abc123.ngrok-free.app
Dashboard URL: wss://abc123.ngrok-free.app (replace https:// with wss://)

The dashboard automatically handles:
- Rosbridge: ws://192.168.1.100:8000/rosbridge (or wss:// with ngrok)
- WebRTC signaling: http://192.168.1.100:8000/webrtc/ (or https:// with ngrok)
```

**How it works:**

- Nginx listens on port 8000 and multiplexes rosbridge (9090) and WebRTC (8080)
- ngrok tunnels your nginx proxy for remote access
- You only need to enter the base URL in the dashboard
- **Important**: ngrok provides an `https://` URL - replace it with `wss://` when connecting in the dashboard

### Supported ROS Message Types

The dashboard subscribes to standard ROS message types:

- **Camera**: `sensor_msgs/CompressedImage`, `sensor_msgs/Image`
- **LiDAR**: `sensor_msgs/LaserScan`
- **IMU**: `sensor_msgs/Imu`
- **Odometry**: `nav_msgs/Odometry`
- **Control**: `geometry_msgs/Twist` (published to `/cmd_vel`)

### Topic Configuration

The dashboard auto-discovers available topics. Default subscriptions:

- Camera: `/camera/image_raw/compressed`
- LiDAR: `/scan`
- IMU: `/imu`
- Odometry: `/odom`
- Battery: `/battery_state`

Topics can be selected dynamically through the UI.

## Usage

### Connecting to Your Robot

1. **Start the Dashboard (not on robot)**:

   ```bash
   npm run dev
   # Opens at http://localhost:5173
   ```

2. **Configure Connection**:
   - The dashboard will prompt for your robot's base URL
   - Enter your nginx proxy URL (e.g., `http://192.168.1.100:8000`)
   - **For ngrok**: Replace the `https://` URL with `wss://` (e.g., `https://abc123.ngrok-free.app` → `wss://abc123.ngrok-free.app`)
   - The dashboard automatically appends `/rosbridge` and `/webrtc/` paths

3. **Connect**:
   - Click "Connect" button
   - Dashboard will attempt connection with retry logic
   - Connection status shown with toast notifications

**Connection Examples:**

Enter only the base URL:

- Same network: `http://192.168.1.100:8000`
- Localhost testing: `http://localhost:8000`
- Remote (ngrok): `wss://abc123.ngrok-free.app` (note: wss:// not https://)

### Features Overview

**Camera Section**:

- Real-time WebRTC video streaming
- Low latency (< 200ms typical)
- Automatic reconnection on failure

**LiDAR Visualization**:

- 2D polar plot with D3.js
- Configurable range display
- Real-time point cloud rendering

**IMU Telemetry**:

- 3-axis orientation (roll, pitch, yaw)
- Linear acceleration graphs
- Angular velocity visualization

**Control Section**:

- 8-directional movement buttons
- Linear velocity slider (0-1.0 m/s)
- Angular velocity slider (0-1.0 rad/s)
- Emergency stop button
- Pilot mode for click-to-move control

**Topic Monitor**:

- Live list of available ROS topics
- Message counts and frequencies
- Topic type information

## Architecture

### Hybrid Communication Strategy

The dashboard uses a hybrid approach for optimal performance:

**WebRTC (for video)**:

- Low-latency video streaming (< 200ms)
- 30 fps (throttled at 30fps)
- Efficient bandwidth usage
- Direct peer-to-peer when possible
- Runs on port 8080 (or via nginx proxy)

**roslib + rosbridge (for control & telemetry)**:

- Robot control commands (`/cmd_vel`)
- Sensor data (LiDAR, IMU, odometry)
- Topic discovery and monitoring
- Runs on port 9090 (or via nginx proxy)

### Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (buttons, inputs, etc.)
│   ├── dashboard/             # Main dashboard layout
│   ├── sensorsection/         # Camera, LiDAR, IMU visualizations
│   ├── controlsection/        # Movement controls and pilot mode
│   └── topicsection/          # Topic monitoring
├── contexts/
│   ├── ros/                   # ROS connection context (roslib)
│   ├── webrtc/                # WebRTC video context
│   ├── control/               # Robot control context
│   └── lidar-zoom/            # LiDAR visualization state
├── config/
│   ├── ros.ts                 # ROS configuration
│   └── webrtc.ts              # WebRTC configuration
├── utils/
│   └── globalHelpers.ts       # Shared utilities
└── layouts/
    └── DashboardLayout.tsx    # Main layout component
```

### Data Flow

1. **Connection**: WebSocket established via rosbridge
2. **Discovery**: Automatic topic discovery using rosapi
3. **Subscription**: Subscribe to selected sensor topics
4. **Visualization**: Real-time rendering with React and D3.js
5. **Control**: Command publishing with priority queue
6. **Video**: Separate WebRTC connection for camera feed

## Development

### Code Quality Tools

- **TypeScript**: Full type safety with strict mode
- **ESLint**: Linting with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

### Performance Optimizations

- **React 19**: Automatic batching and transitions
- **Vite**: Fast HMR and optimized builds
- **Canvas Rendering**: Hardware-accelerated visualizations
- **Memory Management**: Limited data history buffers
- **Component Optimization**: React.memo and useCallback

### Building for Production

```bash
# Build the application
npm run build

# Output in dist/ directory
# Deploy to static hosting (GitHub Pages, Vercel, Netlify, etc.)
```

**GitHub Pages Configuration**:
The project is configured for GitHub Pages deployment with base path `/robot-telemetry-dashboard/`. Update `vite.config.ts` if deploying elsewhere.

## Deployment

### GitHub Pages

The project includes configuration for GitHub Pages deployment:

1. Build the project: `npm run build`
2. Deploy `dist/` folder to `gh-pages` branch
3. Access at: `https://jragni.github.io/robot-telemetry-dashboard/`

### Custom Domain

For custom domain deployment:

1. Update `base` in `vite.config.ts` to `'/'`
2. Build and deploy to your hosting provider
3. Ensure WebSocket connections use correct URLs

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to rosbridge

- Verify rosbridge is running: `ros2 topic list`
- Check firewall allows port 9090
- Verify WebSocket URL format (ws:// or wss://)
- For HTTPS sites, use wss:// (secure WebSocket)

**Problem**: Video feed not working

- Verify WebRTC server is running on port 8080
- Check camera topic is publishing: `ros2 topic hz /camera/image_raw/compressed`
- Verify nginx proxy is configured correctly if using it
- Check browser console for WebRTC errors

**Problem**: Commands not reaching robot

- Verify topic: `ros2 topic echo /cmd_vel`
- Check robot is subscribed to `/cmd_vel`
- Verify rosbridge connection is active

### Performance Issues

**Problem**: Laggy video or controls

- Reduce video quality in WebRTC settings
- Check network bandwidth
- Close unused browser tabs
- Check robot CPU usage

**Problem**: LiDAR visualization slow

- Reduce scan rate on robot side
- Check browser GPU acceleration is enabled
- Limit displayed scan points

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Follow existing code style (run `npm run lint`)
4. Test on both desktop and mobile
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with modern web technologies for the robotics community. Special thanks to:

- ROS Bridge Suite developers
- shadcn/ui for beautiful components
- D3.js for powerful visualizations

---

For issues or questions, please open an issue on GitHub.
