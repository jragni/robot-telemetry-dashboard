# Codebase Concerns

**Analysis Date:** 2026-03-15

## Tech Debt

**Excessive console logging in production code (~52 instances):**
- Issue: Verbose debugging output left throughout connection hooks
- Files: `src/hooks/webrtc/useWebRTC.ts` (30+ statements), `src/lib/webrtc/signaling.ts`, `src/hooks/ros/useRos.ts`, `src/hooks/ros/useSubscriber.ts`, `src/hooks/ros/useTopics.ts`, `src/components/video/WebRTCVideo.tsx`, `src/components/pilot-mode/PilotVideoFeed.tsx`
- Why: Development/debugging during initial build
- Impact: Cluttered browser console, potential exposure of internal state, minor performance overhead
- Fix approach: Implement a logging utility with environment-based log levels, or strip console statements in production builds

**Placeholder helper files with empty TODOs:**
- Issue: 8+ files contain only `// TODO: Add ... helper functions` with no actual code
- Files: `src/components/control/constants.ts`, `src/contexts/control/helpers.ts`, `src/layouts/helpers.ts`, `src/components/connections/helpers.ts`, `src/contexts/webrtc/helpers.ts`, `src/components/telemetry/helpers.ts`, `src/contexts/lidar-zoom/helpers.ts`, `src/utils/globalHelpers.ts`
- Why: Created as part of feature scaffolding structure
- Impact: False structure that clutters codebase; imports may reference empty modules
- Fix approach: Either populate with actual helpers or remove unused files

**Fragile roslib CommonJS workaround:**
- Issue: `vite.config.ts` has `define: { 'this.ROSLIB': 'window.ROSLIB' }` to fix roslib's CommonJS `var ROSLIB = this.ROSLIB || {}` pattern
- File: `vite.config.ts` (lines 18-20)
- Why: roslib doesn't support ESM natively
- Impact: Will break if roslib updates internal patterns; makes migration to other build tools risky
- Fix approach: Pin roslib version, document workaround, monitor for ESM-compatible alternatives

## Known Bugs

**No confirmed bugs detected.** The codebase has several areas with potential issues (see Fragile Areas) but no reproducible bugs were identified from static analysis.

## Security Considerations

**Unprotected JSON parsing from localStorage:**
- Risk: Corrupted or tampered localStorage values could crash the app via `JSON.parse()` without try-catch
- Files: `src/contexts/ros/RosContext.tsx` (lines 45-46 - robot connections), `src/components/ThemeProvider.tsx` (line 15 - theme)
- Current mitigation: None
- Recommendations: Wrap JSON.parse in try-catch with validation of parsed data structure; consider Zod schema validation

**No runtime validation of incoming ROS messages:**
- Risk: Malformed messages from robot could crash components
- Files: `src/hooks/ros/useSubscriber.ts` (line 59 - `setData(message as T)` with no validation)
- Current mitigation: TypeScript type casting (compile-time only)
- Recommendations: Add runtime validation for critical message types (Zod or io-ts), at minimum add try-catch around message processing

**Missing localStorage value validation:**
- Risk: Invalid theme or config values bypass TypeScript safety at runtime
- Files: `src/components/ThemeProvider.tsx` (theme cast as `Theme | null`), `src/contexts/ros/RosContext.tsx` (robots parsed without schema check)
- Current mitigation: Type assertions only
- Recommendations: Validate parsed values match expected schemas

## Performance Bottlenecks

**No significant performance issues detected.** The application handles real-time data streams efficiently through:
- Conditional subscription (only when connected)
- Throttled updates in useSubscriber
- Efficient D3.js rendering

**Potential concern - Large hook complexity:**
- Problem: `src/hooks/webrtc/useWebRTC.ts` is 425 lines with complex async state management
- Cause: WebRTC connection lifecycle is inherently complex
- Improvement path: Extract sub-functions or split into multiple focused hooks

## Fragile Areas

**WebRTC connection state management:**
- File: `src/hooks/webrtc/useWebRTC.ts`
- Why fragile: Race conditions between async SDP exchange and peer connection state changes; code explicitly checks for replaced connections (lines 228-244) but silently returns
- Common failures: Connection state could remain `'connecting'` indefinitely if answer is ignored
- Safe modification: Ensure `isConnectingRef` reset covers all code paths
- Test coverage: None

**Signaling client connection detection:**
- File: `src/lib/webrtc/signaling.ts`
- Why fragile: HEAD request error handling swallows errors with `.catch(() => null)`; sets `isConnected = true` based on non-null response
- Common failures: Could report connected when server returns error status
- Safe modification: Check response.ok explicitly
- Test coverage: None

**Fetch requests without timeout:**
- Files: `src/lib/webrtc/signaling.ts` (HEAD request line 42, POST request line 83)
- Why fragile: No AbortController timeout; requests can hang indefinitely
- Fix approach: Add AbortController with configurable timeout

## Scaling Limits

**Not applicable** - This is a browser-based dashboard connecting to individual robots. Scaling is limited by browser resources and network bandwidth, not application architecture.

## Dependencies at Risk

**roslib 1.4.1:**
- Risk: CommonJS-only package requiring Vite workaround; uncertain maintenance cadence
- Impact: Build breaks if workaround stops working; no ESM alternative
- Migration plan: Monitor roslibjs GitHub for ESM support; document workaround thoroughly

## Missing Critical Features

**No automated testing:**
- Problem: Zero test coverage across entire codebase
- Current workaround: Manual testing only
- Blocks: Confident refactoring, regression detection, CI/CD gates
- Implementation complexity: Medium (Vitest + testing-library setup, mock infrastructure for roslib/WebRTC)

## Test Coverage Gaps

**Entire codebase untested:**
- What's not tested: Everything
- Risk: Regressions go undetected; connection edge cases untested
- Priority: High for connection hooks (`useRos`, `useWebRTC`), Medium for UI components
- Difficulty to test: Connection hooks require mocking roslib and WebRTC APIs; UI components are standard React testing

**Specific high-risk untested areas:**
- ROS connection/reconnection logic: `src/hooks/ros/useRos.ts`
- WebRTC connection/signaling: `src/hooks/webrtc/useWebRTC.ts`, `src/lib/webrtc/signaling.ts`
- Robot CRUD operations: `src/contexts/ros/RosContext.tsx`
- URL derivation: `src/contexts/ros/helpers.ts`

## Inconsistencies

**Retry behavior differs between ROS and WebRTC:**
- ROS: Fixed 3-second intervals, 3 max attempts (`src/hooks/ros/useRos.ts`, `src/config/ros.ts`)
- WebRTC: Exponential backoff 2s-30s, 3 max attempts (`src/hooks/webrtc/useWebRTC.ts`, `src/config/webrtc.ts`)
- Impact: User confusion about reconnection behavior
- Recommendation: Standardize retry strategy or document the intentional difference

**Type assertion patterns:**
- File: `src/lib/webrtc/signaling.ts` (lines 126, 154-156)
- Issue: Double type cast `as unknown as` pattern suggests event emitter typing could be improved
- Recommendation: Refactor SignalingClient to use proper generics for event types

---

*Concerns audit: 2026-03-15*
*Update as issues are fixed or new ones discovered*
