# Feature Spec: Telemetry Widgets

## What It Does

Provides a suite of data visualization widgets that consume RxJS Observables from the ROS connection
layer and render robot sensor data in appropriate formats. Each widget is self-contained: it subscribes
to a ROS topic, handles its own loading/error/disconnect states, and renders a responsive visualization
appropriate to its data type.

Widgets are designed to be placed inside the Panel System (Phase 6). Each widget receives a `robotId`
and a `panelId` prop — it owns its own topic subscription and tears down cleanly on unmount.

---

## Shared Infrastructure

### `useRosConnection` Hook

All widgets share a single hook for accessing the connection layer.

```typescript
// src/features/telemetry/hooks/useRosConnection.ts
function useRosConnection(robotId: string): UseRosConnectionResult;
```

Returns:

- `isConnected: boolean` — derived from `ros.store` connection state
- `transport: RosTransport | null` — active transport from RosServiceRegistry (null if disconnected)
- `connectionState: ConnectionState` — full state for status display

**Behavior:**

- Reads from `useRosStore` (Phase 4 store) — no direct roslib access
- Memoized per `robotId`; referentially stable when state unchanged

### `NoConnectionOverlay` Component

Rendered over any widget when `isConnected === false`.

```typescript
// src/features/telemetry/components/NoConnectionOverlay/NoConnectionOverlay.tsx
interface NoConnectionOverlayProps {
  robotId: string;
  connectionState: ConnectionState;
}
```

**Behavior:**

- Displays status icon + message appropriate to state:
  - `connecting` → spinner + "Connecting to {robotId}…"
  - `disconnected` → gray icon + "Not connected"
  - `error` → red icon + error message (truncated to 80 chars)
- Semi-transparent overlay (`backdrop-blur-sm`, `bg-background/80`) — does not unmount the widget beneath
- Uses `StatusIndicator` from design system

**Edge cases:**

- If `connectionState` transitions from disconnected → connected, overlay fades out; widget resumes
- Overlay must not capture pointer events so the panel drag handle still works

### Widget Registration (for Phase 6 Panel System)

Each widget exports a `widgetMeta` constant consumed by the panel registry.

```typescript
// Pattern for every widget
export const widgetMeta: WidgetMeta = {
  id: 'imu-display', // Unique stable ID
  label: 'IMU', // Display name in "Add Panel" menu
  description: 'Orientation and acceleration from IMU sensor',
  defaultTopicType: 'sensor_msgs/Imu', // Auto-match hint for topic picker
  defaultSize: { w: 4, h: 3 }, // Grid units (react-grid-layout)
  minSize: { w: 2, h: 2 },
};
```

The panel registry (Phase 6) maps `widgetMeta.id` → component. Widgets do not import the panel
registry — one-way dependency only (panel imports widget, never the reverse).

---

## Sub-Feature 1: IMU Widget

### What It Does

Displays IMU data from `sensor_msgs/Imu` topics. Two display modes, toggled via widget header button:

- **Digital view** (default): numeric readout of orientation (roll/pitch/yaw in degrees), angular
  velocity (rad/s), and linear acceleration (m/s²). Monospace font (`Geist Mono`) for alignment.
- **Plot view**: rolling time-series chart showing the last 10 seconds of roll/pitch/yaw.

### Props / Inputs

```typescript
// src/features/telemetry/components/ImuWidget/ImuWidget.types.ts
interface ImuWidgetProps {
  robotId: string;
  panelId: string;
  topicName: string; // e.g. "/imu/data"
  throttleMs?: number; // default: 100ms (10Hz display cap)
}
```

### Data Flow

```
roslib.Topic (sensor_msgs/Imu)
  → TopicSubscriber.createTopicSubscription({ throttleTime: throttleMs })
  → Observable<ImuMessage>
  → useImuData(robotId, topicName, throttleMs) hook
      → converts quaternion → euler via quaternionToEuler()
      → pushes to ring buffer (300 samples @ 10Hz = 30s window)
  → ImuWidget renders digital or plot view from hook state
```

### Quaternion → Euler Conversion

```typescript
// src/features/telemetry/utils/quaternionToEuler.ts
function quaternionToEuler(q: Quaternion): EulerAngles;
// Returns { roll, pitch, yaw } in degrees (not radians — display-ready)
```

Uses ZYX convention (standard for ROS IMU). Pure function, no side effects — unit tested exhaustively.

### Edge Cases

- **100Hz IMU**: throttleMs default 100ms caps display at 10Hz; ring buffer still uses throttled
  rate, so buffer never overflows from high-frequency source
- **Quaternion normalization**: if `|q| !== 1.0` (within tolerance 1e-6), normalize before
  conversion; do not throw — emit normalized value with console.warn
- **Missing fields**: `sensor_msgs/Imu` has optional covariance arrays; widget renders `—` for
  fields not present in message
- **Discontinuity in yaw** (wraps ±180°): plot view renders raw values; discontinuity is correct
  behavior, not a bug
- **Widget resize**: digital view reflowable; plot view re-renders canvas at new size via
  ResizeObserver
- **No data yet** (subscribed but zero messages): show skeleton loaders for each value field, not
  `0.0`

### Acceptance Criteria

- [ ] Digital view renders roll/pitch/yaw, angular velocity (x/y/z), linear acceleration (x/y/z)
- [ ] Values use `Geist Mono` font, right-aligned, 2 decimal places
- [ ] Plot view renders 3-line time series (roll=blue, pitch=green, yaw=yellow) via Recharts
- [ ] Toggle button in widget header switches between digital and plot views
- [ ] `quaternionToEuler` unit tested: identity quaternion = 0/0/0, edge cases at ±180° yaw
- [ ] Throttle at 100ms prevents excessive re-renders at 100Hz source
- [ ] `NoConnectionOverlay` renders when disconnected
- [ ] Skeleton loading state renders before first message

---

## Sub-Feature 2: LiDAR Widget

### What It Does

Renders a 2D top-down laser scan from `sensor_msgs/LaserScan` onto an HTML Canvas element. Points
are rendered as dots in the design system's telemetry blue, overlaid on a dark background with a
robot-center crosshair.

Provides zoom controls (zoom in/out/reset buttons) and optional pan via pointer drag.

### Props / Inputs

```typescript
// src/features/telemetry/components/LidarWidget/LidarWidget.types.ts
interface LidarWidgetProps {
  robotId: string;
  panelId: string;
  topicName: string; // e.g. "/scan"
  throttleMs?: number; // default: 100ms (10Hz display cap)
  maxRange?: number; // meters — filters points beyond this range (default: use message max_range)
}
```

### Data Flow

```
roslib.Topic (sensor_msgs/LaserScan)
  → TopicSubscriber.createTopicSubscription({ throttleTime: throttleMs })
  → Observable<LaserScanMessage>
  → useLidarScan(robotId, topicName, throttleMs) hook
      → converts polar → cartesian via polarToCartesian()
      → filters out points where range > maxRange or range < range_min
      → stores as Float32Array for efficient canvas draw
  → LidarWidget renders to Canvas 2D on each data update
```

### Polar → Cartesian Conversion

```typescript
// src/features/telemetry/utils/polarToCartesian.ts
function polarToCartesian(
  scan: LaserScanMessage,
  maxRange: number
): Float32Array;
// Returns flat [x0, y0, x1, y1, ...] in meters, robot-centric
// x = range * cos(angle_min + i * angle_increment)
// y = range * sin(angle_min + i * angle_increment)
```

Pure function. Returns `Float32Array` for direct typed array canvas draw — avoids GC pressure at 10Hz.

### Canvas Rendering

- Canvas fills widget bounds; robot at center
- Scale: auto-fits all points with 10% padding margin
- Crosshair (thin `--border` color lines) at robot center
- Points rendered as 2px filled circles in `--telemetry` color
- `requestAnimationFrame` gate: only redraws if data changed since last frame

### Edge Cases

- **Partial scan**: some ranges may be `Infinity` or `NaN` (out of range) — skip those points
- **angle_increment = 0**: degenerate scan — render single dot at angle_min, log warning
- **Empty scan** (ranges array length 0): render only crosshair + "No scan data" text centered
- **Widget resize**: ResizeObserver triggers canvas resize + immediate redraw
- **Very dense scan** (e.g. 1440 points at 0.25° increment): Float32Array path handles efficiently;
  no per-point object allocation
- **Zoom out of bounds**: clamp scale so robot stays visible (minimum 1m radius visible)
- **Pan + reconnect**: reset pan/zoom to default on reconnect (stale position confuses users)

### Acceptance Criteria

- [ ] Polar to Cartesian conversion unit tested: known angle/range → expected x/y
- [ ] Infinity/NaN ranges filtered out (unit test)
- [ ] Canvas renders points in telemetry blue on dark background
- [ ] Crosshair visible at robot center
- [ ] Zoom in/out/reset buttons functional
- [ ] Pan via pointer drag functional
- [ ] ResizeObserver triggers canvas resize without jank
- [ ] `NoConnectionOverlay` renders when disconnected
- [ ] Empty scan renders "No scan data" placeholder, not blank canvas

---

## Sub-Feature 3: Topic List Widget

### What It Does

Displays all ROS topics discoverable from the connected robot. For each topic shows: name, message
type, and subscription status. Allows the user to:

- Subscribe to any topic (opens a JSON message preview panel)
- Unsubscribe from active subscriptions
- Filter topics by name (search input)
- Copy topic name to clipboard

This widget is primarily a diagnostic/developer tool and is also the mechanism by which users
configure other widgets (e.g., pick which `/imu/data` topic to feed into the IMU widget).

### Props / Inputs

```typescript
// src/features/telemetry/components/TopicListWidget/TopicListWidget.types.ts
interface TopicListWidgetProps {
  robotId: string;
  panelId: string;
}
// No topicName prop — this widget IS the topic browser
```

### Data Flow

```
TopicDiscovery.getTopics$(robotId)
  → Observable<TopicInfo[]>
  → useTopicList(robotId) hook
      → re-fetches on reconnect
      → merges with activeSubscriptions from ros.store
  → TopicListWidget renders filterable list

User clicks "Subscribe" →
  TopicSubscriber.createTopicSubscription(topicName, messageType)
  → Observable<unknown> (raw JSON)
  → latest message stored in local state
  → JsonPreviewPanel renders stringified last message
```

### Edge Cases

- **No topics returned** (robot connected but no topics yet): show "Fetching topics…" skeleton,
  retry `getTopics$()` every 5s
- **Large topic list** (100+ topics): virtual list via `@tanstack/react-virtual` to avoid DOM bloat
- **Subscription to high-frequency topic** (e.g. `/imu/data` at 100Hz): throttle preview to 2Hz
  (500ms) — full rate would freeze JSON serialization
- **Message too large for preview** (>10KB serialized): truncate JSON to 10KB + show "…truncated"
  warning
- **Topic disappears after subscribe**: emit error on Observable, show inline error in row, offer
  retry button
- **Robot reconnects**: topic list re-fetches automatically; active subscriptions are resubscribed
  by the connection layer (Phase 4)
- **Filter with no matches**: show "No topics match '{filter}'" empty state, not blank

### Acceptance Criteria

- [ ] Topic list renders name + message type for each discovered topic
- [ ] Filter input narrows list in real time (no debounce needed — local filter)
- [ ] Subscribe button creates subscription + opens JSON preview
- [ ] Unsubscribe button tears down subscription + closes preview
- [ ] JSON preview updates at throttled 2Hz for high-frequency topics
- [ ] Large messages truncated at 10KB in preview
- [ ] Virtual list handles 100+ topics without performance degradation
- [ ] Re-fetches on reconnect
- [ ] `NoConnectionOverlay` renders when disconnected

---

## Sub-Feature 4: Data Plot Widget

### What It Does

A general-purpose numeric data visualizer. Given any ROS topic, it:

1. Introspects the message type to find all numeric fields
2. Presents the user a field picker (checkboxes)
3. Plots selected fields as a rolling time-series line chart

Automatically picks the best chart type:

- **Time series** (default): for any numeric field over time
- **Gauge** (future, Phase 2): for bounded scalars (e.g. battery %, 0-100)

For v3 MVP: time series only. Gauge deferred.

### Props / Inputs

```typescript
// src/features/telemetry/components/DataPlotWidget/DataPlotWidget.types.ts
interface DataPlotWidgetProps {
  robotId: string;
  panelId: string;
  topicName: string;
  selectedFields?: string[]; // dot-path e.g. ["linear.x", "angular.z"]
  windowSecs?: number; // rolling window in seconds, default 30
  throttleMs?: number; // default 100ms
}
```

### Data Flow

```
roslib.Topic (any message type)
  → TopicSubscriber.createTopicSubscription({ throttleTime: throttleMs })
  → Observable<unknown>
  → extractNumericFields(message) → string[] (dot-paths to numeric leaf nodes)
  → useDataPlot(robotId, topicName, selectedFields, windowSecs, throttleMs)
      → ring buffer per field (windowSecs / (throttleMs/1000) samples)
      → outputs { timestamps: number[], series: Record<string, number[]> }
  → DataPlotWidget renders Recharts LineChart
```

### Numeric Field Extraction

```typescript
// src/features/telemetry/utils/extractNumericFields.ts
function extractNumericFields(message: unknown, prefix?: string): string[];
// Recursively walks object, returns dot-paths to number-valued leaf nodes
// e.g. for Twist message → ["linear.x", "linear.y", "linear.z", "angular.x", ...]
// Skips arrays (too complex for MVP), skips strings/booleans
```

### Ring Buffer

```typescript
// src/features/telemetry/utils/RingBuffer.ts
class RingBuffer<T> {
  constructor(capacity: number);
  push(value: T): void;
  toArray(): T[]; // oldest → newest
  get size(): number;
}
```

Capacity = `Math.ceil(windowSecs / (throttleMs / 1000))`. On resize (user changes window), create
new buffer — do not attempt in-place resize.

### Edge Cases

- **Topic with no numeric fields** (e.g. `std_msgs/String`): show "No numeric fields in this
  message type" empty state
- **Field disappears** between messages (schema change mid-stream): gap in line chart (no
  interpolation) — Recharts handles `undefined` values in series natively
- **All fields deselected**: render empty chart with axes only + "Select fields above" hint
- **window change** by user: drop old buffer, create new — brief blank chart is acceptable
- **High-frequency source** (100Hz): throttleMs=100 caps at 10Hz; 30s window = 300 samples per
  field — well within memory budget
- **Simultaneous field count > 5**: allow it but show a warning badge "High series count may
  reduce performance"
- **NaN or Infinity values in message**: skip those samples (do not push to buffer); Recharts
  would render discontinuity

### Acceptance Criteria

- [ ] `extractNumericFields` unit tested: Twist message → correct 6 dot-paths
- [ ] `extractNumericFields` unit tested: nested objects (3 levels deep)
- [ ] `RingBuffer` unit tested: push/overflow/toArray
- [ ] Field picker renders checkboxes for each numeric field, checked = in chart
- [ ] Time series chart renders with correct x-axis (time) and y-axis (value)
- [ ] Rolling window respected: old data drops off left edge of chart
- [ ] Chart uses design system chart palette (blue first series, green second, etc.)
- [ ] No numeric fields empty state renders correctly
- [ ] `NoConnectionOverlay` renders when disconnected

---

## Sub-Feature 5: Depth Camera Widget

### What It Does

Displays a live image from a depth or RGB camera publishing `sensor_msgs/CompressedImage`. The
base64-encoded image data is decoded and drawn to an HTML Canvas element. Supports an optional
colormap overlay for depth images (false-color visualization of distance).

### Props / Inputs

```typescript
// src/features/telemetry/components/DepthCameraWidget/DepthCameraWidget.types.ts
interface DepthCameraWidgetProps {
  robotId: string;
  panelId: string;
  topicName: string; // e.g. "/camera/depth/compressed"
  throttleMs?: number; // default: 100ms (10Hz display cap)
  colormap?: ColormapType; // 'none' | 'jet' | 'grayscale', default 'none'
  showFps?: boolean; // overlay FPS counter, default false
}

type ColormapType = 'none' | 'jet' | 'grayscale';
```

### Data Flow

```
roslib.Topic (sensor_msgs/CompressedImage)
  → TopicSubscriber.createTopicSubscription({ throttleTime: throttleMs })
  → Observable<CompressedImageMessage>
  → useDepthCamera(robotId, topicName, throttleMs) hook
      → base64 decode: atob(message.data) → Uint8Array
      → create Blob (format from message.format: "jpeg", "png")
      → createObjectURL(blob) → img.src
      → on img load: drawImage(img) to Canvas
      → revoke previous ObjectURL (memory management)
  → DepthCameraWidget renders Canvas
```

### Colormap Application

Applied post-draw only when `colormap !== 'none'`:

```typescript
// src/features/telemetry/utils/applyColormap.ts
function applyColormap(ctx: CanvasRenderingContext2D, type: ColormapType): void;
// Reads ImageData from canvas, applies per-pixel colormap transform, writes back
```

- `jet`: maps grayscale value to blue→cyan→green→yellow→red spectrum (standard depth visualization)
- `grayscale`: no-op (already grayscale; included for completeness)
- Applied at 10Hz max regardless of throttleMs to avoid canvas thrashing

### Edge Cases

- **Large compressed images** (e.g. 1280×720 JPEG): use `createObjectURL` + `img` decode path
  (not base64 canvas drawImage directly) — browser's JPEG decoder is faster than manual decode
- **Base64 decode failure** (malformed data): catch error, render error state with message
  "Corrupt image data received", do not crash
- **Image format not jpeg/png** (e.g. `rgb8` raw): render "Unsupported format: {format}" in widget,
  not crash
- **Memory leak from ObjectURLs**: previous URL revoked immediately after `drawImage` completes
- **Widget resize**: Canvas dimensions updated via ResizeObserver; next frame redraws at new size
- **No frames received yet**: render dark canvas with centered camera icon (from Lucide React) +
  "Awaiting feed…" text
- **Colormap + resize**: colormap must be re-applied after resize redraw, not just on data update
- **FPS counter**: calculated as 1000 / (currentTimestamp - lastTimestamp), smoothed with EMA
  alpha=0.1, rendered as small badge in top-right corner of canvas

### Acceptance Criteria

- [ ] Base64 → ObjectURL → Canvas pipeline renders images without visible artifacts
- [ ] Previous ObjectURL revoked after each frame (verified via mock in unit test)
- [ ] Colormap `jet` transforms grayscale → color correctly (unit test: known input pixel values)
- [ ] Malformed base64 renders error state, not crash
- [ ] Unsupported format renders graceful error state
- [ ] ResizeObserver triggers canvas resize + immediate redraw
- [ ] FPS counter renders when `showFps={true}`, hidden when `false`
- [ ] `NoConnectionOverlay` renders when disconnected
- [ ] "Awaiting feed…" placeholder renders before first frame

---

## Performance Considerations

### IMU at 100Hz

IMU sensors commonly publish at 100-200Hz. Raw subscription at this rate would cause:

- 100 React re-renders/second → jank
- 100 quaternion→euler conversions/second (cheap, acceptable)
- Excessive ring buffer pushes

**Throttle strategy**: `throttleTime(100)` in TopicSubscriber caps display at 10Hz. The `throttleTime`
operator discards intermediate values (not `auditTime` / `bufferTime`) because the latest sample is
the only one needed for display — intermediate values are not meaningful for visualization.

### LiDAR at 10Hz

LiDAR publishes at ~10Hz with 360-1440 points per scan. Risk area: canvas redraws.

**Render strategy**:

- `requestAnimationFrame` gate: only redraw when data has changed
- Float32Array for point data (avoids object allocation per point)
- `clearRect` + batch `fillRect` (or `Path2D`) — no per-point state changes

At 10Hz with 1440 points, this is ~14,400 fillRect calls/second. Acceptable on modern hardware.
If profiling shows jank, batch into a single `Path2D` per redraw.

### Topic List at variable Hz

Preview subscriptions throttled to 2Hz (500ms). This is enforced inside `useTopicList`, not
configurable by the user — prevents accidental 100Hz preview of IMU topics.

### General React Render Budget

All widget hooks must:

1. Return **stable references** when data has not changed (use `useMemo` for derived arrays)
2. **Not re-render on unrelated store changes** (select only needed slices from Zustand stores)
3. **Unsubscribe in useEffect cleanup** — no lingering RxJS subscriptions after unmount

---

## File Structure

```
src/features/telemetry/
  components/
    ImuWidget/
      ImuWidget.tsx
      ImuWidget.types.ts
      ImuWidget.test.tsx
    LidarWidget/
      LidarWidget.tsx
      LidarWidget.types.ts
      LidarWidget.test.tsx
    TopicListWidget/
      TopicListWidget.tsx
      TopicListWidget.types.ts
      TopicListWidget.test.tsx
    DataPlotWidget/
      DataPlotWidget.tsx
      DataPlotWidget.types.ts
      DataPlotWidget.test.tsx
    DepthCameraWidget/
      DepthCameraWidget.tsx
      DepthCameraWidget.types.ts
      DepthCameraWidget.test.tsx
    NoConnectionOverlay/
      NoConnectionOverlay.tsx
      NoConnectionOverlay.types.ts
      NoConnectionOverlay.test.tsx
  hooks/
    useRosConnection.ts
    useRosConnection.test.ts
    useImuData.ts
    useImuData.test.ts
    useLidarScan.ts
    useLidarScan.test.ts
    useTopicList.ts
    useTopicList.test.ts
    useDataPlot.ts
    useDataPlot.test.ts
    useDepthCamera.ts
    useDepthCamera.test.ts
  utils/
    quaternionToEuler.ts
    quaternionToEuler.test.ts
    polarToCartesian.ts
    polarToCartesian.test.ts
    extractNumericFields.ts
    extractNumericFields.test.ts
    applyColormap.ts
    applyColormap.test.ts
    RingBuffer.ts
    RingBuffer.test.ts
  types/
    telemetry.types.ts       # Shared widget types (WidgetMeta, etc.)
    ros-sensor-messages.types.ts  # sensor_msgs type definitions

src/shared/types/
  widget.types.ts            # WidgetMeta interface (used by panel registry)
```

---

## ROS Message Types Referenced

| ROS Type                      | Widget            | Key Fields Used                                                       |
| ----------------------------- | ----------------- | --------------------------------------------------------------------- |
| `sensor_msgs/Imu`             | ImuWidget         | orientation (x/y/z/w), angular_velocity, linear_acceleration          |
| `sensor_msgs/LaserScan`       | LidarWidget       | ranges[], angle_min, angle_max, angle_increment, range_min, range_max |
| `sensor_msgs/CompressedImage` | DepthCameraWidget | data (base64), format ("jpeg"/"png")                                  |
| any numeric topic             | DataPlotWidget    | all numeric leaf fields (auto-detected)                               |
| introspection (getTopics)     | TopicListWidget   | topic names + types from rosbridge getTopics response                 |

---

## Dependencies

| Package                   | Purpose                                      | Already in project? |
| ------------------------- | -------------------------------------------- | ------------------- |
| `recharts`                | Time series charts (DataPlot, IMU plot view) | No — add in Phase 5 |
| `@tanstack/react-virtual` | Virtual list for TopicListWidget             | No — add in Phase 5 |
| `lucide-react`            | Icons (camera icon, etc.)                    | Check Phase 2       |

No new Canvas dependencies — native Canvas 2D API only (LiDAR, Depth Camera).
