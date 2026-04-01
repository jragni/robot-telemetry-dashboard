import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Ros } from 'roslib';
import { useRosSubscriber } from '@/hooks/useRosSubscriber';
import { rafThrottle } from '@/utils/rafThrottle';
import { CANVAS_FALLBACKS } from '@/utils/canvasColors';
import type { TelemetrySeries, PlotDataPoint } from '../types/TelemetryPanel.types';
import type {
  OdometryMessage,
  TwistMessage,
  ImuMessage,
  BatteryStateMessage,
  LaserScanMessage,
} from '@/types/ros2-messages.types';

/** MAX_POINTS
 * @description Maximum data points per series in the ring buffer (~30s at 10Hz).
 */
const MAX_POINTS = 300;

/** SERIES_COLORS
 * @description Resolved OKLCH colors for telemetry series lines.
 */
const SERIES_COLORS = [
  CANVAS_FALLBACKS.accent,
  CANVAS_FALLBACKS.statusCaution,
  CANVAS_FALLBACKS.statusNominal,
  CANVAS_FALLBACKS.statusCritical,
  CANVAS_FALLBACKS.textSecondary,
  CANVAS_FALLBACKS.textPrimary,
];

/** parsers
 * @description Extracts named numeric values from each supported message type.
 */
function parseMessage(msg: unknown, messageType: string): Record<string, number> {
  switch (messageType) {
    case 'nav_msgs/msg/Odometry': {
      const m = msg as OdometryMessage;
      return {
        'Linear (m/s)': Math.abs(m.twist.twist.linear.x),
        'Angular (rad/s)': Math.abs(m.twist.twist.angular.z),
      };
    }
    case 'geometry_msgs/msg/Twist': {
      const m = msg as TwistMessage;
      return {
        'Linear X (m/s)': Math.abs(m.linear.x),
        'Angular Z (rad/s)': Math.abs(m.angular.z),
      };
    }
    case 'sensor_msgs/msg/Imu': {
      const m = msg as ImuMessage;
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
      const m = msg as BatteryStateMessage;
      const pct = m.percentage > 1 ? m.percentage : m.percentage * 100;
      return {
        'Voltage (V)': m.voltage,
        'Percentage (%)': pct,
      };
    }
    case 'sensor_msgs/msg/LaserScan': {
      const m = msg as LaserScanMessage;
      let min = Infinity;
      let sum = 0;
      let count = 0;
      for (const r of m.ranges) {
        if (!Number.isFinite(r) || r < m.range_min || r > m.range_max) continue;
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
 * @description Subscribes to any supported ROS topic type and extracts numeric
 *  values as time series for the TelemetryPanel. Supports Odometry, Twist,
 *  IMU, BatteryState, and LaserScan message types.
 * @param ros - Live Ros instance, or undefined.
 * @param topicName - The ROS topic to subscribe to.
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
  const throttledSet = useMemo(() => rafThrottle((s: readonly TelemetrySeries[]) => {
    setSeries(s);
  }), []);

  const onMessage = useCallback((msg: unknown) => {
    const values = parseMessage(msg, messageType);
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
        color: SERIES_COLORS[colorIdx % SERIES_COLORS.length],
        data: [...buf],
      });
      colorIdx += 1;
    }

    throttledSet(newSeries);
  }, [messageType, throttledSet]);

  useRosSubscriber(ros, topicName, messageType, onMessage);

  return series;
}
