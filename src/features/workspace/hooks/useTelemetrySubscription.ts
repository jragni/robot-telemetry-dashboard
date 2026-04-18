import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Ros } from 'roslib';
import { z } from 'zod';
import { useRosSubscriber } from '@/hooks';
import { CANVAS_FALLBACKS, rafThrottle } from '@/utils';
import { sensorVector3Schema, vector3Schema } from '@/types/ros2-schemas';
import type { TelemetrySeries, PlotDataPoint } from '../types/TelemetryPanel.types';

const ZERO_VEC3 = { x: 0, y: 0, z: 0 };

/** odometryMessageSchema
 * @description Zod schema for consumed fields of nav_msgs/msg/Odometry.
 *  Accepts null at each nesting level (rosbridge CBOR serialization).
 */
export const odometryMessageSchema = z.object({
  twist: z
    .object({
      twist: z
        .object({
          linear: vector3Schema,
          angular: vector3Schema,
        })
        .nullable()
        .transform((v) => v ?? { linear: ZERO_VEC3, angular: ZERO_VEC3 }),
    })
    .nullable()
    .transform((v) => v ?? { twist: { linear: ZERO_VEC3, angular: ZERO_VEC3 } }),
});

/** twistMessageSchema
 * @description Zod schema for consumed fields of geometry_msgs/msg/Twist.
 */
export const twistMessageSchema = z.object({
  linear: vector3Schema,
  angular: vector3Schema,
});

/** telemetryImuMessageSchema
 * @description Zod schema for consumed IMU fields in the telemetry context.
 *  Accepts null fields (rosbridge CBOR serialization), defaults to zero vectors.
 */
export const telemetryImuMessageSchema = z.object({
  angular_velocity: sensorVector3Schema.nullable().transform((v) => v ?? ZERO_VEC3),
  linear_acceleration: sensorVector3Schema.nullable().transform((v) => v ?? ZERO_VEC3),
});

/** telemetryBatteryMessageSchema
 * @description Zod schema for consumed BatteryState fields in the telemetry context.
 */
export const telemetryBatteryMessageSchema = z.object({
  voltage: z.number(),
  percentage: z.number(),
});

/** telemetryLaserScanMessageSchema
 * @description Zod schema for consumed LaserScan fields in the telemetry context.
 *  Accepts null ranges array (rosbridge CBOR serialization), defaults to empty.
 */
export const telemetryLaserScanMessageSchema = z.object({
  range_min: z.number(),
  range_max: z.number(),
  ranges: z.array(z.number().nullable()),
});

const MAX_POINTS = 600;

const SERIES_COLORS = [
  CANVAS_FALLBACKS.accent,
  CANVAS_FALLBACKS.statusCaution,
  CANVAS_FALLBACKS.statusNominal,
  CANVAS_FALLBACKS.statusCritical,
  CANVAS_FALLBACKS.textSecondary,
  CANVAS_FALLBACKS.textPrimary,
];

function parseMessage(msg: unknown, messageType: string): Record<string, number> | null {
  switch (messageType) {
    case 'nav_msgs/msg/Odometry': {
      const result = odometryMessageSchema.safeParse(msg);
      if (!result.success) {
        console.warn('[useTelemetrySubscription] Malformed Odometry:', result.error.issues);
        return null;
      }
      const m = result.data;
      return {
        'Linear (m/s)': Math.abs(m.twist.twist.linear.x),
        'Angular (rad/s)': Math.abs(m.twist.twist.angular.z),
      };
    }
    case 'geometry_msgs/msg/Twist': {
      const result = twistMessageSchema.safeParse(msg);
      if (!result.success) {
        console.warn('[useTelemetrySubscription] Malformed Twist:', result.error.issues);
        return null;
      }
      const m = result.data;
      return {
        'Linear X (m/s)': Math.abs(m.linear.x),
        'Angular Z (rad/s)': Math.abs(m.angular.z),
      };
    }
    case 'sensor_msgs/msg/Imu': {
      const result = telemetryImuMessageSchema.safeParse(msg);
      if (!result.success) {
        console.warn('[useTelemetrySubscription] Malformed Imu:', result.error.issues);
        return null;
      }
      const m = result.data;
      return {
        'Ang Vel X (rad/s)': m.angular_velocity.x,
        'Ang Vel Y (rad/s)': m.angular_velocity.y,
        'Ang Vel Z (rad/s)': m.angular_velocity.z,
        'Accel X (m/s²)': m.linear_acceleration.x,
        'Accel Y (m/s²)': m.linear_acceleration.y,
        'Accel Z (m/s²)': m.linear_acceleration.z,
      };
    }
    case 'sensor_msgs/msg/BatteryState': {
      const result = telemetryBatteryMessageSchema.safeParse(msg);
      if (!result.success) {
        console.warn('[useTelemetrySubscription] Malformed BatteryState:', result.error.issues);
        return null;
      }
      const m = result.data;
      const pct = m.percentage > 1 ? m.percentage : m.percentage * 100;
      return {
        'Voltage (V)': m.voltage,
        'Percentage (%)': pct,
      };
    }
    case 'sensor_msgs/msg/LaserScan': {
      const result = telemetryLaserScanMessageSchema.safeParse(msg);
      if (!result.success) {
        console.warn('[useTelemetrySubscription] Malformed LaserScan:', result.error.issues);
        return null;
      }
      const m = result.data;
      let min = Infinity;
      let sum = 0;
      let count = 0;
      for (const r of m.ranges) {
        if (r === null || !Number.isFinite(r) || r < m.range_min || r > m.range_max) continue;
        if (r < min) min = r;
        sum += r;
        count += 1;
      }
      return {
        'Min Range (m)': count > 0 ? min : 0,
        'Avg Range (m)': count > 0 ? sum / count : 0,
      };
    }
    default:
      return {};
  }
}

/** useTelemetrySubscription
 * @description Subscribes to a ROS topic, extracts numeric fields into time-series buffers,
 *  and returns plottable series data throttled to animation frame rate.
 * @param ros - Active roslib connection, or undefined when disconnected.
 * @param topicName - The ROS topic name to subscribe to.
 * @param messageType - The ROS message type string.
 */
export function useTelemetrySubscription(
  ros: Ros | undefined,
  topicName: string,
  messageType: string,
): readonly TelemetrySeries[] {
  const buffersRef = useRef(new Map<string, PlotDataPoint[]>());
  const [series, setSeries] = useState<readonly TelemetrySeries[]>([]);

  // Clear buffers when topic or type changes
  useEffect(() => {
    return () => {
      buffersRef.current = new Map();
      setSeries([]);
    };
  }, [topicName, messageType]);

  // Throttle series state updates to RAF cadence
  const throttledSet = useMemo(
    () =>
      rafThrottle((s: readonly TelemetrySeries[]) => {
        setSeries(s);
      }),
    [],
  );

  useEffect(() => {
    return () => {
      throttledSet.cancel();
    };
  }, [throttledSet]);

  const onMessage = useCallback(
    (msg: unknown) => {
      try {
        const values = parseMessage(msg, messageType);
        if (!values) return;
        const now = Date.now();
        const buffers = buffersRef.current;

        const newSeries: TelemetrySeries[] = [];
        let colorIdx = 0;

        for (const [label, value] of Object.entries(values)) {
          let buf = buffers.get(label);
          if (!buf) {
            buf = [];
            buffers.set(label, buf);
          }
          buf.push({ timestamp: now, value });
          if (buf.length > MAX_POINTS) buf.shift();

          newSeries.push({
            label,
            color: SERIES_COLORS[colorIdx % SERIES_COLORS.length] ?? CANVAS_FALLBACKS.accent,
            data: [...buf],
          });
          colorIdx += 1;
        }

        throttledSet(newSeries);
      } catch (err) {
        console.warn('[useTelemetrySubscription] Unexpected error processing message:', err);
      }
    },
    [messageType, throttledSet],
  );

  useRosSubscriber(ros, topicName, messageType, onMessage, { throttleRate: 100 });

  return series;
}
