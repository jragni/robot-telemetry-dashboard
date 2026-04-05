import {
  COMPASS_STRIP_VIEWPORT_RATIO,
  COMPASS_STRIP_WIDTH_MAX,
  COMPASS_STRIP_WIDTH_MIN,
} from './constants';

/** clampCompassWidth
 * @description Derives compass strip width from viewport width, clamped to min/max.
 */
export function clampCompassWidth(): number {
  const derived = Math.floor(window.innerWidth * COMPASS_STRIP_VIEWPORT_RATIO);
  return Math.min(COMPASS_STRIP_WIDTH_MAX, Math.max(COMPASS_STRIP_WIDTH_MIN, derived));
}
