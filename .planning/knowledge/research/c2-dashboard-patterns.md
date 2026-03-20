---
title: C2 & Robot Telemetry Dashboard Layout Patterns
date: 2026-03-20
relevance: high
tags:
  [c2, dashboard, layout, foxglove, qgroundcontrol, anduril, palantir, hud, gcs]
---

# C2 Dashboard Research — 4 Layout Paradigms

## Paradigm A: Map Sovereign (QGroundControl / Anduril Lattice)

Full-screen map → video PIP → instrument overlays → toolbar top

## Paradigm B: Video Sovereign (FPV / Teleoperation)

Full-screen video → LiDAR minimap HUD → gauges overlaid → controls bottom

## Paradigm C: Mission Control (Foxglove / Formant)

Configurable panel grid → user arranges freely → default: 3D center + video + plots

## Paradigm D: Combat Ops (Cambridge Pixel / Palantir)

Split-screen map 60% + video tiles 40% → track table below → toolbar top

## Recommendation: Hybrid A+B with mode switch

- Dashboard mode: Map dominant, video PIP (Paradigm A)
- Pilot mode: Video dominant, LiDAR HUD (Paradigm B)
- Engineer mode: Foxglove panel grid (Paradigm C)

## Sources

See full research in c2-researcher agent output.
