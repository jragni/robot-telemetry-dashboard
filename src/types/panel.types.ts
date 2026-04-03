export type PanelId = 'camera' | 'controls' | 'imu' | 'lidar' | 'status' | 'telemetry';

export function isPanelId(value: string): value is PanelId {
  const ids: readonly string[] = ['camera', 'controls', 'imu', 'lidar', 'status', 'telemetry'];
  return ids.includes(value);
}
