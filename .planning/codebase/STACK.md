# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript (ES2022+) - Build scripts, config files (`eslint.config.js`)
- HTML5 - Entry point (`index.html`)
- CSS with Tailwind CSS 4.1.14 - Styling (`src/style.css`)

## Runtime

**Environment:**
- Node.js 18+ (development/build only)
- Browser runtime (production) - Modern browsers with WebRTC and WebSocket support

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.1.1 - UI framework (`src/main.tsx`, `src/App.tsx`)
- React DOM 19.1.1 - DOM rendering

**UI Components:**
- Radix UI - Headless UI primitives (Alert Dialog, Dialog, Label, Select, Separator, Slider, Slot, Tooltip)
- shadcn/ui - Component library built on Radix (`components.json`, `src/components/ui/`)
- Lucide React 0.545.0 - Icon library
- next-themes 0.4.6 - Dark/light theme management (`src/components/ThemeProvider.tsx`)
- Sonner 2.0.7 - Toast notifications (`src/App.tsx`)
- react-resizable-panels - Resizable layout panels

**Data Visualization:**
- D3.js 7.9.0 - LiDAR and IMU plots (`src/components/telemetry/imu/IMUPlot.tsx`)

**Testing:**
- None currently configured

**Build/Dev:**
- Vite 7.1.7 - Bundling and dev server (`vite.config.ts`)
- @vitejs/plugin-react-swc - SWC transpiler for React
- TypeScript compiler (`tsc`) - Type checking

## Key Dependencies

**Critical:**
- roslib 1.4.1 - ROS WebSocket bridge client for robot communication (`src/contexts/ros/RosContext.tsx`, `src/hooks/ros/useRos.ts`)
- WebRTC (browser native) - Peer-to-peer video streaming (`src/hooks/webrtc/useWebRTC.ts`)
- D3.js 7.9.0 - Sensor data visualization

**UI Infrastructure:**
- class-variance-authority 0.7.1 - Component variant management
- clsx 2.1.1 - className composition
- tailwind-merge 3.3.1 - Tailwind class deduplication

## Configuration

**Environment:**
- No .env files required (frontend-only application)
- Runtime configuration via UI (robot URL input)
- Persisted to browser localStorage (robot connections, theme)

**Build:**
- `vite.config.ts` - Build config with path aliases (`@/` -> `src/`) and roslib CommonJS workaround
- `tsconfig.json` / `tsconfig.app.json` - TypeScript strict mode, ES2022 target
- `eslint.config.js` - ESLint 9 flat config with TypeScript, React, a11y, import plugins
- `.prettierrc` - Prettier formatting (single quotes, semicolons, 80 char width)

**Code Quality:**
- ESLint 9.36.0 with typescript-eslint, react-hooks, jsx-a11y, import, prettier plugins
- Prettier 3.6.2
- Husky 9.1.7 - Git hooks
- lint-staged 15.5.2 - Pre-commit formatting/linting

## Platform Requirements

**Development:**
- Any platform with Node.js 18+
- No external dependencies (no database, no backend)

**Production:**
- Static site deployment (GitHub Pages configured via `vite.config.ts` base path)
- Compatible with Vercel, Netlify, or any static hosting
- Requires modern browser with WebRTC and WebSocket support

**Robot-Side (not in this repo):**
- ROS2 Humble on Ubuntu 22.04
- rosbridge_suite (WebSocket server, port 9090)
- Custom WebRTC server (Python aiortc, port 8080)
- Nginx reverse proxy (port 8000, multiplexes rosbridge + WebRTC)

---

*Stack analysis: 2026-03-15*
*Update after major dependency changes*
