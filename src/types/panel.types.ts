export type PanelId = 'camera' | 'controls' | 'imu' | 'lidar' | 'status' | 'telemetry';

/** isPanelId
 * @description Type guard that checks if a string is a valid PanelId.
 * @param value - The string to check.
 * @returns True if the value is a valid PanelId.
 */
export function isPanelId(value: string): value is PanelId {
  const ids: readonly string[] = ['camera', 'controls', 'imu', 'lidar', 'status', 'telemetry'];
  return ids.includes(value);
}
