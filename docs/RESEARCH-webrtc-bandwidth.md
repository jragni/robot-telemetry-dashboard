# WebRTC & Bandwidth Optimization Research

> Research conducted 2026-04-02. Covers rosbridge bandwidth problem analysis, optimization strategies, tunnel alternatives, and WebRTC transport architecture.

## Problem Statement

Running 4+ robots through ngrok with rosbridge JSON-over-WebSocket consumes ~1GB in 2 hours. This is unsustainable for demos and production.

### Root Cause: rosbridge JSON Inflation

rosbridge serializes every ROS message as plain text JSON before sending over WebSocket. This inflates binary data dramatically:

| Data Type | Binary (ROS CDR) | JSON (rosbridge) | Inflation |
|---|---|---|---|
| LaserScan (720 rays) | ~2.9 KB | ~15-25 KB | 5-8x |
| IMU message | ~0.5 KB | ~2.5 KB | 5x |
| Float32 (single) | 4 bytes | 8-10 bytes (ASCII) | 2-2.5x |
| Float32 array (720) | 2,880 bytes | ~7,200 bytes | 2.5x |

### Bandwidth Breakdown (4 robots, current setup)

| Topic | Rate | JSON Size | Per Robot | 4 Robots |
|---|---|---|---|---|
| IMU | 100 Hz | ~2.5 KB | 250 KB/s | 1,000 KB/s |
| LaserScan | 10 Hz | ~20 KB | 200 KB/s | 800 KB/s |
| Odometry | 20 Hz | ~1 KB | 20 KB/s | 80 KB/s |
| Battery | 1 Hz | ~0.2 KB | 0.2 KB/s | 0.8 KB/s |
| **Total** | | | **~470 KB/s** | **~1.88 MB/s** |

At 1.88 MB/s: **1 GB in ~9 minutes**. Actual usage is lower because topics don't always publish at max rate, but the order of magnitude explains 1 GB in 2 hours.

### Key Insight: RAF Throttle Does NOT Reduce Wire Bandwidth

The browser-side `requestAnimationFrame` throttle in `useRosSubscriber` is a **rendering optimization only**. rosbridge sends every message at the source rate regardless of what the client does with them. The data has already traveled the full path (robot -> rosbridge -> ngrok -> browser) before RAF decides whether to render it.

## Current Architecture

```
Robot Pi                    Cloud                    Browser
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ ROS 2 Topics │      │              │      │              │
│   IMU 100Hz  │──┐   │              │      │  useRosSub   │
│   LiDAR 10Hz │  │   │    ngrok     │      │  (RAF only)  │
│   Odom 20Hz  │  ├──►│   (metered   │─────►│              │
│   Battery 1Hz│  │   │    relay)    │      │  Zustand     │
│              │──┘   │              │      │  Store       │
│  rosbridge   │      │              │      │              │
│  (JSON/WS)   │      │              │      │              │
├──────────────┤      └──────────────┘      ├──────────────┤
│  aiortc      │◄─── WebRTC (P2P) ────────►│  <video>     │
│  (camera)    │      (already efficient)   │  element     │
└──────────────┘                            └──────────────┘
```

Camera is already on WebRTC (separate path, efficient). The problem is exclusively rosbridge telemetry.

## Quick Wins (Dashboard-Only Changes)

These require changes only in the dashboard's `useRosSubscriber` hook where `ROSLIB.Topic` is constructed. No robot-side changes needed.

### 1. `throttle_rate` — Server-Side Topic Throttling

```typescript
new ROSLIB.Topic({
  ros,
  name: topicName,
  messageType,
  throttle_rate: 100,  // ms — server sends at most 10 msgs/sec
  queue_length: 1,     // drop stale messages, keep only latest
});
```

rosbridge applies `throttle_rate` **server-side** before putting messages on the wire. This is the single most impactful change.

**Recommended rates:**
| Topic | Source Rate | Throttled Rate | `throttle_rate` value |
|---|---|---|---|
| IMU | 100 Hz | 10 Hz | 100 ms |
| LaserScan | 10 Hz | 2-5 Hz | 200-500 ms |
| Odometry | 20 Hz | 5 Hz | 200 ms |
| Battery | 1 Hz | 1 Hz | 1000 ms |

**Controls (cmd_vel) are unaffected** — they are outbound publishes, not subscriptions.

### 2. `compression: 'cbor'` — Binary Encoding

```typescript
new ROSLIB.Topic({
  ros,
  name: topicName,
  messageType,
  compression: 'cbor',  // binary encoding instead of JSON text
});
```

CBOR (Concise Binary Object Representation) encodes the same data as JSON but in binary. Numbers stored as IEEE 754 binary (4-8 bytes) instead of ASCII text. 40-70% size reduction on float-heavy messages like LaserScan and IMU.

Requires rosbridge to have CBOR support enabled (default in recent versions).

### 3. `queue_length: 1` — Drop Stale Messages

Tells rosbridge to keep only the latest message per topic. If the client can't consume fast enough, old messages are dropped instead of queued.

### 4. WebSocket Compression (`permessage-deflate`)

Add to rosbridge launch:
```bash
ros2 launch rosbridge_server rosbridge_websocket_launch.xml use_compression:=true
```

Enables per-message deflate compression on the WebSocket itself. Additional 30-50% reduction on top of throttling.

### Combined Estimated Impact

| Optimization | Reduction |
|---|---|
| throttle_rate (IMU 100->10Hz, LiDAR 10->5Hz) | ~70-80% |
| CBOR encoding | ~40-70% on remaining |
| queue_length: 1 | Prevents backlog spikes |
| permessage-deflate | ~30-50% on remaining |
| **Combined** | **~85-95%** |

From ~1.88 MB/s down to ~100-280 KB/s for 4 robots. **1 GB would last 1-3 hours instead of 9 minutes.**

## Tunnel Alternatives

### ngrok (Current)
- Metered bandwidth, expensive at scale
- Simple setup, public URL
- No viewer install required

### Cloudflare Tunnel
- **Free**, no bandwidth limits
- No viewer install required (public URL)
- Adds 15-45ms latency (Cloudflare edge)
- `cloudflared` runs on robot Pi
- Best drop-in ngrok replacement

### Tailscale
- P2P WireGuard mesh, free tier
- No bandwidth metering, minimal latency
- **Requires Tailscale app on every viewer device** — defeats zero-install goal
- Good for robot-to-robot or robot-to-relay, not for end-user viewing

### Self-Hosted Relay (frp)
- Full control, $5/mo VPS
- Can be "smart" — aggregate, transform, throttle, cache
- Robots connect outbound (no firewall issues)
- Viewers connect via HTTPS URL

### WebRTC (P2P)
- No tunnel needed for direct connections
- STUN handles NAT traversal (~85% success)
- TURN fallback for symmetric NAT
- Tiny signaling relay needed (stateless, free tier)
- Best long-term architecture

## foxglove_bridge

[foxglove_bridge](https://github.com/foxglove/ros-foxglove-bridge) is a C++ ROS 2 node that replaces rosbridge with a binary CDR protocol.

### Advantages
- **60-70% bandwidth reduction** over rosbridge JSON — native binary CDR encoding
- **Drop-in replacement** via `@foxglove/roslibjs-foxglove` adapter (same API as roslibjs)
- Supports topics, services, parameters
- C++ performance (lower CPU on robot Pi)
- Actively maintained by Foxglove team

### Limitations
- Does **not** support ROS 2 actions
- Custom protocol (not rosbridge WebSocket standard)
- Requires `foxglove_bridge` node running on robot instead of rosbridge

### Dashboard Integration
```typescript
// Replace roslib connection
import { FoxgloveClient } from '@foxglove/roslibjs-foxglove';

// Same ROSLIB.Topic API, binary protocol underneath
const ros = new FoxgloveClient({ url: 'ws://robot:8765' });
```

## WebRTC DataChannel Architecture (Long-Term)

Full replacement of rosbridge with WebRTC-based transport. Eliminates the tunnel entirely for direct connections.

### Three Pieces

**1. `webrtc-ros-bridge` (Python, runs on Robot Pi)**
- rclpy subscribers for each configured topic
- Serializes messages as compact binary (MessagePack or raw CDR)
- Sends over WebRTC DataChannels (one per topic)
- Handles services via reliable+ordered DataChannel with request ID matching
- Handles actions via dedicated DataChannel per action (goal/feedback/result)
- Parameters via single "params" DataChannel with get/set/list protocol
- Camera via WebRTC video track (replaces current aiortc server)

**2. Signaling Relay (Node.js or Cloudflare Worker)**
- Tiny, stateless — only passes SDP offers/answers and ICE candidates
- Can run on free tier (Cloudflare Workers, Deno Deploy, Railway)
- Not in the data path — only used during connection setup

**3. Dashboard WebRTC Client**
- Replaces current roslib WebSocket connection
- RTCPeerConnection with DataChannels
- Binary deserialization (MessagePack/CDR -> JS objects)
- Same Zustand store interface — components unchanged

### ROS 2 Communication Mapping

| ROS 2 Primitive | WebRTC Transport | Reliability | Pattern |
|---|---|---|---|
| Topics (high-freq sensor) | DataChannel | Unreliable + unordered | One channel per topic |
| Topics (commands, cmd_vel) | DataChannel | Reliable + ordered | Shared "commands" channel |
| Services | DataChannel | Reliable + ordered | Request ID matching |
| Actions | DataChannel | Reliable + ordered | Goal/feedback/result on dedicated channel |
| Parameters | DataChannel | Reliable + ordered | Single "params" channel, get/set/list |

### NAT Traversal
- **STUN**: Free, handles ~85% of NAT types (full cone, restricted cone, port restricted)
- **TURN**: Fallback for symmetric NAT (~15%), requires relay server, adds bandwidth cost
- Google/Twilio provide free STUN servers
- TURN can self-host on same VPS as signaling relay

## Existing ROS-WebRTC Packages

### webrtc_ros (RobotWebTools)
- **Status: Abandoned** — last commit Jan 2023
- Video-only, no DataChannels (callback is empty in C++ code)
- No telemetry, commands, services, actions, or parameters
- Doesn't build on Humble
- **Not recommended**

### opentera-webrtc-ros
- **Status: Active**, maintained
- Supports DataChannels + video + commands
- Custom protocol (not rosbridge compatible)
- Would require custom dashboard adapter
- Worth evaluating if building custom transport

## Recommended Path

### Immediate (30 min, ~85-95% bandwidth reduction)
1. Add `throttle_rate` + `queue_length: 1` + `compression: 'cbor'` to `useRosSubscriber`
2. Enable `permessage-deflate` on rosbridge launch
3. No robot code changes, no infrastructure changes

### Medium-Term (foxglove_bridge swap)
1. Replace rosbridge with foxglove_bridge on robot Pi
2. Swap `roslib` for `@foxglove/roslibjs-foxglove` in dashboard
3. Binary CDR protocol, same API surface
4. ~60-70% reduction over rosbridge JSON (cumulative with throttling)

### Long-Term (WebRTC transport layer)
1. Build `webrtc-ros-bridge` Python service for robot Pi
2. Deploy signaling relay (Cloudflare Worker or similar)
3. Replace dashboard transport layer with WebRTC client
4. P2P connections, no tunnel needed, full ROS 2 primitive support
5. Unifies camera + telemetry + commands into single WebRTC connection
