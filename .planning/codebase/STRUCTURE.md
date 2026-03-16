# Codebase Structure

**Analysis Date:** 2026-03-15

## Directory Layout

```
robot-telemetry-dashboard/
├── public/                    # Static assets
├── src/                       # Application source code
│   ├── main.tsx              # Vite entry point
│   ├── App.tsx               # Root component with context providers
│   ├── style.css             # Global styles (Tailwind imports)
│   ├── vite-env.d.ts         # Vite type declarations
│   │
│   ├── layouts/              # Page-level layouts
│   ├── components/           # Feature-scoped React components
│   │   ├── ui/              # Shadcn/Radix UI primitives
│   │   ├── connections/     # Robot connection management
│   │   ├── control/         # Robot movement controls
│   │   ├── telemetry/       # Sensor data visualization
│   │   │   ├── imu/        # IMU telemetry
│   │   │   ├── lidar/      # LiDAR visualization
│   │   │   └── topics/     # Generic topic inspector
│   │   ├── pilot-mode/      # Immersive teleoperation
│   │   ├── video/           # WebRTC video display
│   │   └── ThemeProvider.tsx
│   │
│   ├── contexts/             # React Context providers
│   │   ├── ros/             # ROS connection management
│   │   ├── webrtc/          # Video streaming state
│   │   ├── control/         # Robot movement state
│   │   └── lidar-zoom/     # LiDAR zoom sync
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── ros/             # ROS communication hooks
│   │   ├── webrtc/          # WebRTC hooks
│   │   ├── control/         # Control-specific hooks
│   │   └── use-mobile.ts   # Responsive breakpoint hook
│   │
│   ├── lib/                  # Library code
│   │   ├── webrtc/          # WebRTC signaling client
│   │   └── utils.ts         # Class utilities (cn)
│   │
│   ├── config/               # Application configuration
│   │   ├── ros.ts           # ROS connection settings
│   │   └── webrtc.ts        # WebRTC settings
│   │
│   └── utils/                # Utility functions
│       └── globalHelpers.ts # Shared helpers (clamp, etc.)
│
├── .husky/                    # Git hooks
├── .github/                   # GitHub workflows
├── index.html                 # HTML entry point
├── vite.config.ts             # Build configuration
├── tsconfig.json              # TypeScript config (references)
├── tsconfig.app.json          # App TypeScript config
├── eslint.config.js           # ESLint flat config
├── .prettierrc                # Prettier config
├── components.json            # shadcn/ui config
├── package.json               # Dependencies and scripts
├── package-lock.json          # Lockfile
├── README.md                  # Project documentation
├── ROBOT_NGINX_SETUP.md       # Robot-side nginx setup guide
└── CLAUDE.md                  # Claude Code instructions
```

## Directory Purposes

**src/layouts/**
- Purpose: Page-level layout components
- Contains: `DashboardLayout.tsx` (main), `PilotModeLayout.tsx` (immersive), `Header.tsx` (nav bar)
- Key files: `DashboardLayout.tsx` - primary application layout with resizable panels
- Subdirectories: None

**src/components/connections/**
- Purpose: Robot connection management UI
- Contains: Sidebar, add/edit modals, robot list, delete confirmation
- Key files: `ConnectionsSidebar.tsx`, `AddRobotModal.tsx`, `RobotList.tsx`, `DeleteRobotDialog.tsx`

**src/components/control/**
- Purpose: Robot movement control interface
- Contains: Gamepad-style controls, velocity sliders, topic selector
- Key files: `ControlPanel.tsx`, `VelocitySliders.tsx`, `TopicSelector.tsx`

**src/components/telemetry/**
- Purpose: Sensor data visualization
- Contains: IMU, LiDAR, and generic topic display
- Subdirectories: `imu/` (IMU card + plot), `lidar/` (LiDAR card + canvas), `topics/` (topic list)

**src/components/pilot-mode/**
- Purpose: Immersive teleoperation mode
- Contains: Desktop/mobile layouts, pilot controls, video feed, LiDAR minimap
- Key files: `PilotModeLayoutDesktop.tsx`, `PilotControlPanel.tsx`, `PilotVideoFeed.tsx`

**src/components/video/**
- Purpose: WebRTC video stream display
- Key files: `WebRTCVideo.tsx`

**src/components/ui/**
- Purpose: Reusable shadcn/Radix UI primitive components
- Contains: Button, Card, Dialog, Select, Slider, Tooltip, Sidebar, etc.
- Note: These are generated/managed by shadcn CLI

**src/contexts/**
- Purpose: Global state management via React Context
- Structure: Each subdirectory has `*Context.tsx` + `definitions.ts` + `helpers.ts`
- Subdirectories: `ros/`, `webrtc/`, `control/`, `lidar-zoom/`

**src/hooks/**
- Purpose: Custom React hooks for data integration
- Structure: Domain-organized matching contexts
- Subdirectories: `ros/` (useRos, useSubscriber, usePublisher, useTopics), `webrtc/` (useWebRTC), `control/` (useAvailableControlTopics)

**src/lib/**
- Purpose: Non-React library code
- Key files: `webrtc/signaling.ts` (WebRTC signaling client), `utils.ts` (cn class utility)

**src/config/**
- Purpose: Application configuration constants
- Key files: `ros.ts` (connection params, retry config), `webrtc.ts` (STUN servers, reconnect limits)

## Key File Locations

**Entry Points:**
- `src/main.tsx` - Application bootstrap, mounts React to DOM
- `src/App.tsx` - Root component, context provider tree
- `src/layouts/DashboardLayout.tsx` - Main layout orchestrator

**Configuration:**
- `vite.config.ts` - Build config, path aliases, roslib workaround
- `tsconfig.app.json` - TypeScript strict config, ES2022 target
- `eslint.config.js` - ESLint 9 flat config
- `.prettierrc` - Formatting rules
- `components.json` - shadcn/ui component config

**Core Logic:**
- `src/contexts/ros/RosContext.tsx` - ROS connection lifecycle
- `src/contexts/webrtc/WebRTCContext.tsx` - WebRTC stream management
- `src/contexts/control/ControlContext.tsx` - Robot movement commands
- `src/hooks/ros/useRos.ts` - ROS bridge connection with auto-reconnect
- `src/hooks/webrtc/useWebRTC.ts` - WebRTC peer connection management
- `src/lib/webrtc/signaling.ts` - WebRTC SDP signaling client

**Type Definitions:**
- `src/contexts/ros/definitions.ts` - ROS message types (Twist, Imu, LaserScan, etc.)
- `src/contexts/webrtc/definitions.ts` - WebRTC state types
- `src/contexts/control/definitions.ts` - Control state and direction types
- `src/contexts/lidar-zoom/definitions.ts` - LiDAR zoom types

**Testing:**
- No test files or test configuration present

## Naming Conventions

**Files:**
- PascalCase.tsx: React components (`ControlPanel.tsx`, `IMUCard.tsx`, `WebRTCVideo.tsx`)
- kebab-case.tsx: shadcn/ui primitives (`alert-dialog.tsx`, `field.tsx`)
- camelCase.ts: Hooks (`useRos.ts`, `useSubscriber.ts`), helpers (`globalHelpers.ts`)
- lowercase.ts: Config files (`ros.ts`, `webrtc.ts`)
- definitions.ts / helpers.ts / constants.ts: Per-feature support files

**Directories:**
- kebab-case: All directories (`pilot-mode/`, `lidar-zoom/`)
- Feature-organized: Grouped by domain, not by type

**Special Patterns:**
- No index.ts barrel files (direct imports)
- `definitions.ts` for type exports per feature
- `helpers.ts` for feature-specific utilities (many are placeholder)

## Where to Add New Code

**New Telemetry Sensor:**
- Component: `src/components/telemetry/{sensor-name}/`
- Types: `src/components/telemetry/{sensor-name}/definitions.ts`
- Subscribe via: `useSubscriber<SensorMessage>` in component

**New Context Provider:**
- Implementation: `src/contexts/{domain}/`
- Files: `{Domain}Context.tsx` + `definitions.ts` + `helpers.ts`
- Wire up in: `src/App.tsx` provider tree

**New Custom Hook:**
- Implementation: `src/hooks/{domain}/use{HookName}.ts`
- Follow patterns in existing hooks (useSubscriber, usePublisher)

**New UI Component:**
- shadcn primitive: `src/components/ui/` (use shadcn CLI)
- Feature component: `src/components/{feature}/`

**New Configuration:**
- Config: `src/config/{domain}.ts`

## Special Directories

**src/components/ui/**
- Purpose: Generated shadcn/ui components
- Source: Generated via shadcn CLI (`components.json` config)
- Committed: Yes
- Note: Should not be manually edited extensively

**.husky/**
- Purpose: Git pre-commit hooks (lint-staged)
- Committed: Yes

---

*Structure analysis: 2026-03-15*
*Update when directory structure changes*
