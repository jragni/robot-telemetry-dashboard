# Testing Patterns

**Analysis Date:** 2026-03-15

## Test Framework

**Runner:**
- None configured

**Assertion Library:**
- None configured

**Run Commands:**
```bash
# No test commands in package.json
# Testing infrastructure needs to be set up from scratch
```

## Current State

**No test infrastructure exists:**
- No vitest.config.ts, jest.config.js, or test setup files
- No test files (*.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx)
- No `__tests__` directories
- No testing libraries in package.json dependencies
- 0% automated test coverage

## Recommended Setup

Based on the existing stack (Vite + React + TypeScript), the natural testing setup would be:

**Unit/Integration Testing:**
- Vitest (native Vite integration, fast, compatible with existing config)
- @testing-library/react (component testing)
- @testing-library/jest-dom (DOM matchers)

**E2E Testing:**
- Playwright (browser automation, WebRTC testing support)

**Test Organization:**
- Co-located test files: `*.test.ts` / `*.test.tsx` alongside source
- Test utilities in `src/test/` or `tests/`

## Priority Testing Areas

**High Priority (critical functionality):**
- ROS connection lifecycle (`src/hooks/ros/useRos.ts`)
- WebRTC connection and signaling (`src/hooks/webrtc/useWebRTC.ts`, `src/lib/webrtc/signaling.ts`)
- Control commands (`src/contexts/control/ControlContext.tsx`)
- Robot connection management (`src/contexts/ros/RosContext.tsx`)

**Medium Priority (data handling):**
- ROS message type definitions and helpers (`src/contexts/ros/definitions.ts`, `src/contexts/ros/helpers.ts`)
- URL derivation functions (`deriveRosbridgeUrl`, `deriveWebrtcUrl`)
- LiDAR data processing and visualization
- IMU data parsing and display

**Lower Priority (UI):**
- Component rendering
- Layout responsiveness
- Theme switching

## Mocking Considerations

**Would need mocking:**
- roslib (ROSLIB.Ros, ROSLIB.Topic, ROSLIB.Message)
- RTCPeerConnection (WebRTC browser API)
- localStorage
- fetch (for WebRTC signaling)
- WebSocket connections

**Pure functions (no mocking needed):**
- URL derivation helpers (`src/contexts/ros/helpers.ts`)
- Data transformation functions
- Utility functions (`src/utils/globalHelpers.ts`)

---

*Testing analysis: 2026-03-15*
*Update when test infrastructure is established*
