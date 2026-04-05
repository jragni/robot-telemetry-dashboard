---
name: ros-validate
description: Cross-references Zod schemas against ROS 2 interface definitions. Ensures .nullable() on numeric arrays, correct field names, and rosbridge serialization compatibility.
---

# ROS Validate

Validates that Zod schemas in the codebase match ROS 2 interface definitions and account for rosbridge JSON serialization quirks. Prevents the "works in tests, breaks on real robot" pattern.

## Background

rosbridge serializes ROS messages to JSON. JSON has no `NaN` or `Infinity` literals, so rosbridge sends `null` for those values. LiDAR sensors commonly return `NaN` for out-of-range readings, which becomes `null` in JSON. If a Zod schema expects `z.number()` but receives `null`, validation fails silently and the UI shows no data.

## Schemas to Scan

Find all Zod schemas for ROS messages:

**Known locations:**
- `src/types/ros2-schemas.ts` — shared primitives (vector3Schema, quaternionSchema)
- `src/hooks/useBatterySubscription.ts` — batteryStateMessageSchema
- `src/hooks/useImuSubscription.ts` — imuMessageSchema
- `src/hooks/useLidarSubscription.ts` — laserScanMessageSchema
- `src/features/workspace/hooks/useTelemetrySubscription.ts` — odometryMessageSchema, twistMessageSchema, telemetryImuMessageSchema, telemetryBatteryMessageSchema, telemetryLaserScanMessageSchema

**Discovery:** Also grep for new schemas: `grep -r "z.object" src/ --include="*.ts" | grep -i "schema\|Schema"`

## Validation Rules

### Rule 1: Numeric Array Fields Must Be .nullable()

Any `z.array(z.number())` in a sensor-related schema MUST be `z.array(z.number().nullable())`.

**Fields known to require .nullable():**
- `sensor_msgs/msg/LaserScan` — `ranges`, `intensities`
- Any `float32[]` or `float64[]` field from a physical sensor

**How to check:** Find `z.array(z.number())` patterns in ROS schema files. If the parent schema represents sensor data, flag any array of numbers without `.nullable()`.

### Rule 2: Field Names Match ROS 2 Interface

ROS 2 uses snake_case. Zod schema keys must exactly match the interface definition field names.

**Reference interfaces:**

```
sensor_msgs/msg/LaserScan:
  angle_min, angle_max, angle_increment, time_increment, scan_time,
  range_min, range_max, ranges, intensities

sensor_msgs/msg/Imu:
  header, orientation (Quaternion), orientation_covariance,
  angular_velocity (Vector3), angular_velocity_covariance,
  linear_acceleration (Vector3), linear_acceleration_covariance

sensor_msgs/msg/BatteryState:
  voltage, temperature, current, charge, capacity, design_capacity,
  percentage, power_supply_status, power_supply_health,
  power_supply_technology, present, cell_voltage, cell_temperature,
  location, serial_number

geometry_msgs/msg/Vector3: x, y, z
geometry_msgs/msg/Quaternion: x, y, z, w
geometry_msgs/msg/Twist: linear (Vector3), angular (Vector3)
nav_msgs/msg/Odometry: header, child_frame_id, pose, twist
std_msgs/msg/Header: stamp (sec, nanosec), frame_id
```

**How to check:** For each schema, compare its keys against the reference interface. Flag any key that doesn't exist in the interface, or any interface field that's missing from the schema (as a warning, not a failure — partial schemas are valid if the UI only uses some fields).

### Rule 3: Schema-to-useRosSubscriber Type Match

Every schema must pair with the correct ROS message type string in `useRosSubscriber()`.

**How to check:** Find all `useRosSubscriber(ros, topic, 'TYPE', callback)` calls. The `'TYPE'` string (e.g., `'sensor_msgs/msg/LaserScan'`) must correspond to the schema used in the callback's `.safeParse()`. Flag mismatches.

### Rule 4: Post-Parse Null Handling

After `safeParse`, code that consumes `.nullable()` array fields must handle `null` elements. Check that:
- Array `.filter()` or `.map()` calls handle `null` (e.g., `Number.isFinite(v)` or `v !== null`)
- Canvas draw loops skip null values

**How to check:** Follow the data path from safeParse result to the consumer (hook state, canvas draw function). Flag any array iteration that doesn't guard against null elements.

## Output Format

```
PASS: laserScanMessageSchema (src/hooks/useLidarSubscription.ts)
  - ranges: z.array(z.number().nullable()) — correct
  - intensities: z.array(z.number().nullable()) — correct
  - Field names match sensor_msgs/msg/LaserScan
  - Used with messageType 'sensor_msgs/msg/LaserScan' in useRosSubscriber

FAIL: batteryStateMessageSchema (src/hooks/useBatterySubscription.ts)
  - voltage: z.number() but float32 from sensor — consider .nullable() for hardware fault readings
  - Missing fields: temperature, current (optional but useful for monitoring)

WARN: imuMessageSchema (src/hooks/useImuSubscription.ts)
  - covariance arrays omitted (acceptable if not consumed by UI)
```

## When to Run

- After creating or modifying any Zod schema for ROS messages
- Before connecting to a real robot for the first time with new code
- As part of the pre-merge gate for any PR touching `*Subscription.ts` hooks
- After adding a new ROS topic subscription
