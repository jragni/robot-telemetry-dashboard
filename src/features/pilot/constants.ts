/** MINIMAP_SIZE_MIN
 * @description Minimum pixel size for the responsive LiDAR minimap canvas.
 */
export const MINIMAP_SIZE_MIN = 120;

/** MINIMAP_SIZE_MAX
 * @description Maximum pixel size for the responsive LiDAR minimap canvas.
 */
export const MINIMAP_SIZE_MAX = 220;

/** MINIMAP_VIEWPORT_RATIO
 * @description Fraction of viewport height used to derive minimap size.
 */
export const MINIMAP_VIEWPORT_RATIO = 0.2;

/** MINIMAP_RANGE_DEFAULT
 * @description Default range in meters for the LiDAR minimap.
 */
export const MINIMAP_RANGE_DEFAULT = 20;

/** PILOT_ZOOM_MIN
 * @description Minimum zoom level for the pilot LiDAR minimap.
 */
export const PILOT_ZOOM_MIN = 0.5;

/** PILOT_ZOOM_MAX
 * @description Maximum zoom level for the pilot LiDAR minimap.
 */
export const PILOT_ZOOM_MAX = 4;

/** PILOT_ZOOM_STEP
 * @description Zoom increment per mouse wheel tick or button press.
 */
export const PILOT_ZOOM_STEP = 0.2;

/** COMPASS_STRIP_WIDTH
 * @description Width in pixels for the compass heading strip canvas.
 */
export const COMPASS_STRIP_WIDTH = 320;

/** COMPASS_STRIP_HEIGHT
 * @description Height in pixels for the compass heading strip canvas.
 */
export const COMPASS_STRIP_HEIGHT = 40;

/** COMPASS_TICK_MAJOR_INTERVAL
 * @description Degrees between major tick marks on the compass strip.
 */
export const COMPASS_TICK_MAJOR_INTERVAL = 30;

/** COMPASS_TICK_MINOR_INTERVAL
 * @description Degrees between minor tick marks on the compass strip.
 */
export const COMPASS_TICK_MINOR_INTERVAL = 10;

/** COMPASS_CARDINALS
 * @description Cardinal direction labels and their degree positions for the
 *  horizontal heading strip.
 */
export const COMPASS_CARDINALS: readonly { label: string; deg: number }[] = [
  { label: 'N', deg: 0 },
  { label: 'E', deg: 90 },
  { label: 'S', deg: 180 },
  { label: 'W', deg: 270 },
];

/** COMPASS_DEGREES_VISIBLE
 * @description Total degrees visible in the compass strip viewport.
 */
export const COMPASS_DEGREES_VISIBLE = 120;

/** HUD_PANEL_BASE
 * @description Shared Tailwind classes for all HUD overlay panels. Tactical
 *  glass display aesthetic — low border-radius, accent-tinted border,
 *  transparent background with subtle blur.
 */
export const HUD_PANEL_BASE =
  'bg-surface-base/60 backdrop-blur-sm border border-accent/20 border-t-accent/10 rounded-sm pointer-events-auto';

/** LIDAR_POINT_RADIUS
 * @description Radius in pixels for each LiDAR scan point in the minimap.
 */
export const LIDAR_POINT_RADIUS = 2;

/** LIDAR_POINT_GLOW
 * @description Canvas shadowBlur value for radar phosphor glow effect.
 */
export const LIDAR_POINT_GLOW = 2;

/** BATTERY_THRESHOLDS
 * @description Battery percentage thresholds for status color changes.
 */
export const BATTERY_THRESHOLDS = {
  critical: 15,
  caution: 30,
} as const;

/** PILOT_FULLSCREEN_Z
 * @description Z-index for the fullscreen overlay. Must exceed AppShell sidebar (z-40).
 */
export const PILOT_FULLSCREEN_Z = 'z-50';

/** PLACEHOLDER_TELEMETRY
 * @description Static placeholder telemetry data used before ROS wiring is
 *  implemented. Returns safe defaults for all HUD elements.
 */
export const PLACEHOLDER_TELEMETRY = {
  imu: { roll: 0, pitch: 0, yaw: 0 },
  lidarPoints: [],
  lidarRangeMax: 20,
  battery: null,
  linearSpeed: 0,
  uptimeSeconds: null,
} as const;
