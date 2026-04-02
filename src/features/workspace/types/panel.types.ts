import type { WORKSPACE_PANEL_META } from '../constants';

/** PanelId
 * @description Union type of all workspace panel IDs, derived from WORKSPACE_PANEL_META.
 */
export type PanelId = (typeof WORKSPACE_PANEL_META)[number]['id'];
