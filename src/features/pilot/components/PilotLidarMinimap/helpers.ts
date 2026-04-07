import { MINIMAP_SIZE_MAX, MINIMAP_SIZE_MIN, MINIMAP_VIEWPORT_RATIO } from './constants';

/** clampSize
 * @description Derives minimap size from viewport height, clamped to min/max.
 * @param ceiling - Optional max override for mobile contexts.
 */
export function clampSize(ceiling = MINIMAP_SIZE_MAX): number {
  const max = Math.min(MINIMAP_SIZE_MAX, ceiling);
  const derived = Math.floor(window.innerHeight * MINIMAP_VIEWPORT_RATIO);
  return Math.min(max, Math.max(MINIMAP_SIZE_MIN, derived));
}
