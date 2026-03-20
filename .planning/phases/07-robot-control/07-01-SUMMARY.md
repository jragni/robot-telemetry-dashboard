# Phase 7: Robot Control — Summary

## Delivered

Full robot control feature with safety-critical E-Stop, directional D-pad, velocity sliders, topic selector, and ROS Twist message publishing — all TDD with comprehensive test coverage.

## Components

| Component       | Path                                             | Purpose                                                   |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- |
| ControlWidget   | `src/features/pilot/components/ControlWidget/`   | Orchestrator — wires store, publisher, and sub-components |
| EStop           | `src/features/pilot/components/EStop/`           | Emergency stop button with explicit release               |
| ControlPad      | `src/features/pilot/components/ControlPad/`      | Directional D-pad (forward/backward/left/right/stop)      |
| VelocitySliders | `src/features/pilot/components/VelocitySliders/` | Linear + angular velocity controls                        |
| TopicSelector   | `src/features/pilot/components/TopicSelector/`   | cmd_vel topic picker                                      |

## Architecture

| Layer      | Implementation                                                                 |
| ---------- | ------------------------------------------------------------------------------ |
| State      | `controlStore.ts` — per-robot Zustand vanilla store via factory pattern        |
| Publishing | `useControlPublisher.ts` — 50ms interval publishing, auto e-stop on disconnect |
| Types      | `robot-control.types.ts` — Direction union, ControlState interface             |
| Utils      | `twistBuilder.ts` — buildTwist() and zeroTwist() helpers                       |

## Safety-Critical Design

1. **E-Stop publishes zero-velocity Twist immediately** — no debounce
2. **Connection loss triggers automatic E-Stop** without user interaction
3. **E-Stop disables ALL controls** — setDirection() is a no-op when eStopActive
4. **E-Stop requires explicit release** — no auto-release on reconnect
5. **Per-robot factory stores** — no singleton, no fixed array (v2 lesson)
6. **activateEStop atomically** sets `eStopActive: true` AND `activeDirection: null`

## Quality Gate

| Check      | Result                |
| ---------- | --------------------- |
| Lint       | 0 errors, 0 warnings  |
| TypeScript | 0 errors              |
| Tests      | 427 passed (51 files) |
| Build      | Clean                 |

## Accessibility

- E-Stop: `aria-label="E-Stop"`, `role="alert"` on active banner, 64px touch target
- D-pad buttons: aria-labels, touch events with preventDefault, 48px targets
- Sliders: htmlFor/id linked, aria-valuemin/max/now, disabled states
- All native HTML elements — keyboard accessible by default

## Files Changed/Added

### New files

- `src/features/pilot/components/` — 5 component directories with .tsx, .types.ts, .test.tsx each
- `src/features/pilot/hooks/useControlPublisher.ts` + test
- `src/features/pilot/stores/controlStore.ts` + test
- `src/features/pilot/types/robot-control.types.ts`
- `src/features/pilot/utils/twistBuilder.ts` + test
- `src/services/ros/transport/ros.types.ts` — IRos interface
- `e2e/robot-control.spec.ts` — E2E tests
- `.planning/knowledge/specs/SPEC-robot-control.md`

### Modified files

- `src/features/dashboard/registry/panelRegistry.ts` — registered ControlWidget
- `src/features/dashboard/registry/defaultLayouts.ts` — added robot-controls to pilot layout
- `src/features/dashboard/modes/PilotMode/PilotMode.tsx` — integrated ControlWidget
- `src/features/dashboard/modes/PilotMode/PilotMode.test.tsx` — added control panel tests
- `src/features/dashboard/DashboardView.tsx` — passes robotId to modes
- `src/services/ros/publisher/TopicPublisher.ts` — accepts IRos interface
- `src/services/ros/transport/RosTransport.ts` — implements IRos

## Review Notes

- `ControlPad.tsx` contains a private `DirectionButton` helper component with an inline interface — minor convention deviation, accepted as the helper is tightly coupled and unexported
- `ControlWidget.tsx` uses `as unknown as ROSLIB.Ros` double-cast to bridge IRos interface to concrete ROSLIB.Ros — standard pattern for interface/concrete bridging
