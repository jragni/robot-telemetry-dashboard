# Phase 11: Workspace Data Layer + Panel Components

**Status:** Not Started
**Branch:** EPIC/v4-rebuild

## Goal

Replace mock panel scaffolding with production panel components backed by a shared mock simulation. Components accept real data interfaces — mock simulation is the first data source, roslib drops in later without changing components.

## Architecture

```
MockEnvironment (shared state)
  ├─ walls, obstacles, robot position/heading
  ├─ driven by Controls panel (D-pad input)
  └─ consumed by Camera, LiDAR, IMU, SystemStatus, Telemetry

Panel Components (production)
  ├─ Accept data via props/hooks (real ROS message shapes)
  ├─ Render with Canvas 2D (Camera, LiDAR, IMU) or DOM (Status, Controls, Telemetry)
  └─ No mock-specific logic inside components
```

## Panel Design Decisions (from discussion)

| Panel         | Data Source                     | Mock Behavior                                                  |
| ------------- | ------------------------------- | -------------------------------------------------------------- |
| Camera        | First-person Canvas 2D          | Corridor view from robot position, vanishing point perspective |
| LiDAR         | Top-down Canvas 2D raycast      | Same environment as Camera, point cloud from above             |
| IMU           | Roll/pitch/yaw                  | Correlated to robot movement in environment                    |
| Controls      | D-pad + E-STOP                  | Drives robot position/heading in shared environment            |
| System Status | CPU, RAM, battery, graph counts | Realistic ticking values                                       |
| Telemetry     | Time-series chart               | TBD — to be decided when designing the card                    |

## Approach

1. Define data interfaces (what each panel expects)
2. Build production panel components (accept data via props)
3. Build shared mock simulation (generates fake data matching interfaces)
4. Wire mock simulation → components
5. Design each card's UI through visual pipeline (one at a time, verified)

## Tasks

- [ ] Define panel data interfaces (types)
- [ ] Camera panel component + card design
- [ ] LiDAR panel component + card design
- [ ] IMU panel component + card design
- [ ] Controls panel component + card design
- [ ] System Status panel component + card design
- [ ] Telemetry panel component + card design
- [ ] Shared mock environment (walls, obstacles, robot position)
- [ ] Wire mock environment → all panels
- [ ] Workspace folder restructure (extract private components from RobotWorkspace.tsx)
