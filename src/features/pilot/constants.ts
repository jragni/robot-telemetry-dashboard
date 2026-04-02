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

/** COMPASS_STRIP_WIDTH_MIN
 * @description Minimum width in pixels for the compass heading strip canvas.
 */
export const COMPASS_STRIP_WIDTH_MIN = 200;

/** COMPASS_STRIP_WIDTH_MAX
 * @description Maximum width in pixels for the compass heading strip canvas.
 */
export const COMPASS_STRIP_WIDTH_MAX = 320;

/** COMPASS_STRIP_VIEWPORT_RATIO
 * @description Fraction of viewport width used to derive compass strip width.
 */
export const COMPASS_STRIP_VIEWPORT_RATIO = 0.25;

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

/** COMPASS_TICK_HEIGHT_MAJOR
 * @description Pixel height of major tick marks on the compass strip.
 */
export const COMPASS_TICK_HEIGHT_MAJOR = 12;

/** COMPASS_TICK_HEIGHT_MINOR
 * @description Pixel height of minor tick marks on the compass strip.
 */
export const COMPASS_TICK_HEIGHT_MINOR = 6;

/** COMPASS_FADE_WIDTH
 * @description Width in pixels of the gradient fade at compass strip edges.
 */
export const COMPASS_FADE_WIDTH = 30;

/** COMPASS_POINTER_HALF_WIDTH
 * @description Half-width in pixels of the center pointer triangle.
 */
export const COMPASS_POINTER_HALF_WIDTH = 5;

/** COMPASS_POINTER_HEIGHT
 * @description Height in pixels of the center pointer triangle.
 */
export const COMPASS_POINTER_HEIGHT = 6;

/** COMPASS_COLORS
 * @description Color resolution mapping for compass canvas — maps local keys
 *  to CSS custom property names.
 */
export const COMPASS_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  textMuted: '--color-text-muted',
  tickMinor: '--color-border',
  tickMajor: '--color-text-secondary',
};

/** LIDAR_TOKEN_MAP
 * @description Color resolution mapping for LiDAR minimap canvas — maps local
 *  keys to CSS custom property names.
 */
export const LIDAR_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  textMuted: '--color-text-muted',
  gridLine: '--color-border',
  nominal: '--color-status-nominal',
  caution: '--color-status-caution',
  critical: '--color-status-critical',
};

/** LIDAR_TICK_LENGTH
 * @description Length in pixels for radial edge tick marks on the minimap.
 */
export const LIDAR_TICK_LENGTH = 4;

/** LIDAR_DETAIL_THRESHOLD
 * @description Minimap size in pixels above which all distance labels are shown.
 */
export const LIDAR_DETAIL_THRESHOLD = 160;

/** LIDAR_DISTANCE_RATIO_CAUTION
 * @description Distance ratio threshold above which points are colored caution.
 */
export const LIDAR_DISTANCE_RATIO_CAUTION = 0.4;

/** LIDAR_DISTANCE_RATIO_CRITICAL
 * @description Distance ratio threshold above which points are colored critical.
 */
export const LIDAR_DISTANCE_RATIO_CRITICAL = 0.7;

/** LIDAR_ROBOT_TRIANGLE_RATIO
 * @description Robot triangle size as a fraction of minimap size.
 */
export const LIDAR_ROBOT_TRIANGLE_RATIO = 0.035;

/** LIDAR_ROBOT_TRIANGLE_MIN
 * @description Minimum robot triangle size in pixels.
 */
export const LIDAR_ROBOT_TRIANGLE_MIN = 5;

/** VIDEO_STATUS_LABELS
 * @description Maps non-streaming video statuses to user-facing labels.
 */
export const VIDEO_STATUS_LABELS: Record<'idle' | 'connecting' | 'reconnecting' | 'failed', string> = {
  idle: 'No video stream',
  connecting: 'Connecting...',
  reconnecting: 'Reconnecting...',
  failed: 'Stream failed',
};

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
