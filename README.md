# Robot Telemetry Dashboard

A professional drone operator control interface built with Next.js 15, React 18, and TypeScript. This dashboard provides real-time visualization and control of ROS-enabled robots through WebSocket connections.

## 🚁 Features

### Real-Time Data Visualization
- **Camera Streams**: Live video feed from robot cameras (compressed & raw formats)
- **LiDAR Visualization**: Real-time laser scan data with 2D polar plots
- **IMU Telemetry**: Three-axis orientation, acceleration, and angular velocity graphs
- **Topic Monitoring**: Live topic list with message counts and types

### Robot Control
- **Movement Controls**: Directional movement with linear and angular velocity
- **Real-Time Commands**: Prioritized command publishing for responsive control
- **Frame Rate Control**: Optimized 15 FPS streaming for smooth video without control lag

### Professional Interface
- **Drone Operator Layout**: Information-dense design optimized for mission-critical operations
- **Responsive Design**: Full desktop experience with mobile-optimized layouts
- **Dark Theme**: Operator-friendly dark interface with HUD-style overlays
- **Connection Management**: Multiple robot connection support with automatic discovery

## 🛠 Technology Stack

- **Frontend**: Next.js 15.4, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Data Visualization**: D3.js v7 for charts and plots
- **Robot Communication**: ROS Bridge (roslib.js) via WebSocket
- **Build Tool**: Turbopack for fast development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- ROS system (ROS1 or ROS2)
- Robot with camera, LiDAR, and IMU sensors
- Internet connection for remote access (if using ngrok)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd robot-telemetry-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Robot Setup

#### 1. Install ROS Bridge Server

**For ROS2:**
```bash
# Install rosbridge_server
sudo apt install ros-${ROS_DISTRO}-rosbridge-server

# Or build from source
cd ~/ros2_ws/src
git clone https://github.com/RobotWebTools/rosbridge_suite.git
cd ~/ros2_ws && colcon build --packages-select rosbridge_server
```

**For ROS1:**
```bash
# Install rosbridge_server
sudo apt install ros-${ROS_DISTRO}-rosbridge-server

# Or build from source
cd ~/catkin_ws/src
git clone https://github.com/RobotWebTools/rosbridge_suite.git
cd ~/catkin_ws && catkin_make
```

#### 2. Launch ROS Bridge Server

**For ROS2:**
```bash
# Source your workspace
source ~/ros2_ws/install/setup.bash

# Launch rosbridge websocket server
ros2 launch rosbridge_server rosbridge_websocket.launch
```

**For ROS1:**
```bash
# Source your workspace
source ~/catkin_ws/devel/setup.bash

# Launch rosbridge websocket server
roslaunch rosbridge_server rosbridge_websocket.launch
```

#### 3. Remote Access Setup (Optional)

If your robot is not on the same network as your dashboard, use ngrok for secure tunneling:

**Install ngrok:**
```bash
# Download and install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Or download directly
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin
```

**Setup ngrok tunnel:**
```bash
# Create account at https://ngrok.com and get your authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN

# Tunnel rosbridge port (9090) to the internet
ngrok tcp 9090
```

**Use the ngrok URL in dashboard:**
- ngrok will provide a URL like: `tcp://0.tcp.ngrok.io:12345`
- Use this in the dashboard as: `ws://0.tcp.ngrok.io:12345`

## 📱 Usage

### Connecting to Robot
1. Open the dashboard in your browser
2. Click "Add Connection" in the sidebar
3. Enter robot details:
   - **Name**: Friendly name for your robot
   - **WebSocket URL**: 
     - Local network: `ws://your-robot-ip:9090`
     - Remote (ngrok): `ws://0.tcp.ngrok.io:12345`
4. Click "Connect"

**Connection Examples:**
- **Local Robot**: `ws://192.168.1.100:9090`
- **Localhost**: `ws://localhost:9090`
- **Remote via ngrok**: `ws://0.tcp.ngrok.io:12345`

### Supported Message Types
- **Camera**: `sensor_msgs/CompressedImage`, `sensor_msgs/Image`
- **LiDAR**: `sensor_msgs/LaserScan`
- **IMU**: `sensor_msgs/Imu`
- **Control**: `geometry_msgs/Twist`

### Camera Stream
- **Topic Selection**: Choose from available image topics
- **Format Support**: JPEG, PNG (compressed) and RGB8, BGR8, Mono8 (raw)
- **Controls**: START/STOP streaming with live FPS counter

### LiDAR Visualization
- **Real-Time Plotting**: 2D polar coordinate visualization
- **Range Display**: Configurable range limits (default: 5m)
- **Square Aspect Ratio**: Maintains proper scaling

### IMU Telemetry
- **Orientation**: Roll, pitch, yaw in degrees or radians
- **Linear Acceleration**: 3-axis acceleration in m/s²
- **Angular Velocity**: 3-axis rotation in rad/s or deg/s
- **Dynamic Scaling**: Auto-adjusting chart bounds

### Robot Control
- **Movement Grid**: 8-directional movement controls
- **Velocity Sliders**: Linear and angular velocity adjustment
- **Emergency Stop**: Immediate halt command

## 🎯 Design Philosophy

### Control Priority
The dashboard prioritizes control commands over streaming data to ensure responsive robot operation. Video streams are throttled to 15 FPS while commands are published immediately.

### Operator Experience
Designed for professional drone operators with:
- High information density
- Quick access to critical controls
- Minimal visual distractions
- Reliable performance under stress

### Mobile Responsiveness
- **Portrait Mode**: Optimized stacked layout
- **Touch Controls**: Finger-friendly button sizing
- **Scrollable Views**: All data accessible on small screens

## 🔧 Configuration

### Environment Variables
```env
# Optional: Custom port (default: 3000)
PORT=3004

# Optional: Custom host
HOST=0.0.0.0
```

### ROS Topic Configuration
The dashboard automatically discovers available topics. Default topics:
- Camera: `/camera/image_raw/compressed`
- LiDAR: `/scan`
- IMU: `/imu`
- Control: `/cmd_vel`

## 🏗 Architecture

### Component Structure
```
├── components/
│   ├── dashboard/          # Main layout and connection management
│   ├── sensorsection/      # Camera, LiDAR, IMU visualizations
│   ├── controlsection/     # Robot movement controls
│   ├── topicsection/       # Topic monitoring
│   └── sidebar/           # Connection management
```

### Data Flow
1. **Connection**: WebSocket established via rosbridge
2. **Discovery**: Automatic topic discovery using rosapi
3. **Subscription**: Subscribe to selected topics
4. **Processing**: Real-time data processing and visualization
5. **Control**: Command publishing with priority handling

## 📊 Performance Optimizations

- **Frame Rate Control**: 15 FPS video streaming
- **Canvas Rendering**: Hardware-accelerated chart updates
- **Memory Management**: Limited data history (1000 points)
- **WebSocket Optimization**: Binary data transfer
- **Component Optimization**: React.memo and useCallback

## 🛡 Security Considerations

- **Input Validation**: All user inputs sanitized
- **WebSocket Security**: Secure connection handling
- **No Secret Storage**: Credentials not persisted
- **CORS Handling**: Proper cross-origin setup

## 🧪 Development

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting with custom rules
- **Prettier**: Consistent code formatting

### Testing
```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Type checking
npm run type-check
```

### Contributing
1. Follow existing code style
2. Add TypeScript types for new features
3. Test on both desktop and mobile
4. Ensure ROS compatibility

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For issues and questions:
1. Check existing GitHub issues
2. Create new issue with details:
   - ROS version and setup
   - Browser and device info
   - Steps to reproduce
   - Console errors

## 🔄 Roadmap

- [ ] Multi-robot support
- [ ] Data recording and playback
- [ ] Custom dashboard layouts
- [ ] Plugin system for sensors
- [ ] WebRTC video streaming
- [ ] 3D visualization support

---

Built with ❤️ for the robotics community
