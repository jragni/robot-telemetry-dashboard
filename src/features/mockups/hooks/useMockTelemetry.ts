import { useState, useEffect, useRef, useCallback } from 'react';
import { MOCK_LIDAR_POINTS, TELEMETRY_SERIES_COLORS } from '../constants';
import type { MockTelemetryData, TelemetryDataPoint } from '../types/MockupsPage.types';

/** TELEMETRY_BUFFER_SIZE
 * @description Maximum number of telemetry data points per series.
 */
const TELEMETRY_BUFFER_SIZE = 100;

/** createInitialSeries
 * @description Creates the initial telemetry series array.
 */
function createInitialSeries(): { label: string; color: string; data: TelemetryDataPoint[] }[] {
  return [
    { label: 'Sensor A', color: TELEMETRY_SERIES_COLORS[0], data: [] },
    { label: 'Sensor B', color: TELEMETRY_SERIES_COLORS[1], data: [] },
    { label: 'Sensor C', color: TELEMETRY_SERIES_COLORS[2], data: [] },
  ];
}

/** useMockTelemetry
 * @description Provides cycling mock telemetry data for the mockups page panel
 *  demos. All state is self-contained — no external stores. Updates battery,
 *  uptime, IMU orientation, velocity values, and telemetry sine wave data.
 * @returns Mock telemetry data object.
 */
export function useMockTelemetry(): MockTelemetryData {
  const [batteryLevel, setBatteryLevel] = useState(78);
  const [uptimeSeconds, setUptimeSeconds] = useState(3742);
  const [imu, setImu] = useState({ roll: 0, pitch: 0, yaw: 0 });
  const [linearVelocity, setLinearVelocity] = useState(0.15);
  const [angularVelocity, setAngularVelocity] = useState(0.39);
  const seriesRef = useRef(createInitialSeries());
  const [telemetrySeries, setTelemetrySeries] = useState(createInitialSeries);

  const updateSlowValues = useCallback(() => {
    setBatteryLevel((prev) => Math.max(5, prev - 0.1 + Math.random() * 0.15));
    setUptimeSeconds((prev) => prev + 1);
    setImu((prev) => ({
      roll: Math.sin(Date.now() / 2000) * 15,
      pitch: Math.cos(Date.now() / 3000) * 10,
      yaw: (prev.yaw + 0.5) % 360,
    }));
    setLinearVelocity(0.1 + Math.sin(Date.now() / 5000) * 0.05);
    setAngularVelocity(0.3 + Math.cos(Date.now() / 4000) * 0.1);
  }, []);

  const updateTelemetry = useCallback(() => {
    const now = Date.now();
    for (let i = 0; i < seriesRef.current.length; i++) {
      const series = seriesRef.current[i];
      const phase = i * 2;
      const value = Math.sin(now / 1000 + phase) * 50 + 50 + (Math.random() - 0.5) * 10;
      series.data.push({ timestamp: now, value });
      if (series.data.length > TELEMETRY_BUFFER_SIZE) {
        series.data.shift();
      }
    }
    setTelemetrySeries(seriesRef.current.map((s) => ({ ...s, data: [...s.data] })));
  }, []);

  useEffect(() => {
    const slowInterval = setInterval(updateSlowValues, 1000);
    const fastInterval = setInterval(updateTelemetry, 100);

    return () => {
      clearInterval(slowInterval);
      clearInterval(fastInterval);
    };
  }, [updateSlowValues, updateTelemetry]);

  return {
    batteryLevel,
    uptimeSeconds,
    imu,
    linearVelocity,
    angularVelocity,
    lidarPoints: MOCK_LIDAR_POINTS,
    telemetrySeries,
  };
}
