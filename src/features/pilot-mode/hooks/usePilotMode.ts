import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { EMPTY, type Observable } from 'rxjs';

import type { UsePilotModeResult } from './usePilotMode.types';

import { useObservable } from '@/hooks/useObservable';
import { useRosConnection } from '@/hooks/useRosConnection';
import {
  createTopicSubscription,
  TOPIC_THROTTLE_MS,
} from '@/services/ros/subscriber/TopicSubscriber';
import {
  DEFAULT_CONTROL_STATE,
  useControlStore,
} from '@/stores/control/control.store';
import { useWebRTCStore } from '@/stores/webrtc/webrtc.store';
import type { BatteryStateMessage, ImuMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IMU_TOPIC = '/imu/data';
const IMU_MESSAGE_TYPE = 'sensor_msgs/Imu';

const BATTERY_TOPIC = '/battery_state';
const BATTERY_MESSAGE_TYPE = 'sensor_msgs/BatteryState';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a quaternion to yaw in degrees.
 * Uses the standard ZYX Euler decomposition: yaw = atan2(2*(w*z + x*y), 1 - 2*(y^2 + z^2)).
 */
function quaternionToYawDegrees(
  x: number,
  y: number,
  z: number,
  w: number
): number {
  const yawRadians = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
  return (yawRadians * 180) / Math.PI;
}

// ---------------------------------------------------------------------------
// usePilotMode
// ---------------------------------------------------------------------------

/**
 * Core hook for the FPOV pilot mode.
 *
 * - Reads ROS + WebRTC connection states from their respective stores.
 * - Reads linear/angular velocity limits from the control store.
 * - Optionally subscribes to the IMU topic to derive a heading (quaternion → yaw).
 * - Optionally subscribes to the battery_state topic to read battery percentage.
 * - Returns aggregated {@link PilotHudData} and an exit function that navigates
 *   to /dashboard.
 */
export function usePilotMode(robotId: string): UsePilotModeResult {
  const navigate = useNavigate();

  // ---- Connection states ----
  const { ros, connectionState: rosConnectionState } =
    useRosConnection(robotId);

  const webrtcConnectionState = useWebRTCStore((s) =>
    s.getConnectionState(robotId)
  );

  // ---- Velocity state ----
  const { linearVelocity, angularVelocity } =
    useControlStore((s) => s.getControlState(robotId)) ?? DEFAULT_CONTROL_STATE;

  // ---- IMU subscription for heading ----
  const imu$: Observable<ImuMessage | null> = useMemo(() => {
    if (!ros) return EMPTY as Observable<ImuMessage | null>;
    return createTopicSubscription<ImuMessage>(
      ros,
      IMU_TOPIC,
      IMU_MESSAGE_TYPE,
      {
        throttleMs: TOPIC_THROTTLE_MS.IMU,
      }
    ) as Observable<ImuMessage | null>;
  }, [ros]);

  const imuMessage = useObservable<ImuMessage | null>(imu$, null);

  const heading = useMemo<number | undefined>(() => {
    if (!imuMessage) return undefined;
    const { x, y, z, w } = imuMessage.orientation;
    return quaternionToYawDegrees(x, y, z, w);
  }, [imuMessage]);

  // ---- Battery subscription ----
  const battery$: Observable<BatteryStateMessage | null> = useMemo(() => {
    if (!ros) return EMPTY as Observable<BatteryStateMessage | null>;
    return createTopicSubscription<BatteryStateMessage>(
      ros,
      BATTERY_TOPIC,
      BATTERY_MESSAGE_TYPE,
      { throttleMs: TOPIC_THROTTLE_MS.IMU }
    ) as Observable<BatteryStateMessage | null>;
  }, [ros]);

  const batteryMessage = useObservable<BatteryStateMessage | null>(
    battery$,
    null
  );

  const batteryPercentage = useMemo<number | undefined>(() => {
    if (!batteryMessage) return undefined;
    // percentage is 0.0–1.0 in sensor_msgs/BatteryState
    return Math.round(batteryMessage.percentage * 100);
  }, [batteryMessage]);

  // ---- Exit ----
  const exit = () => {
    void navigate('/dashboard');
  };

  return {
    hudData: {
      rosConnectionState,
      webrtcConnectionState,
      linearVelocity,
      angularVelocity,
      heading,
      batteryPercentage,
    },
    exit,
  };
}
