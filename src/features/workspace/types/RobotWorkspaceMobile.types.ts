/** MobileDataPanelId
 * @description Panel IDs available as data tabs on mobile workspace.
 *  Controls is excluded — robot control happens in Pilot Mode.
 */
export type MobileDataPanelId = 'camera' | 'lidar' | 'status' | 'imu' | 'telemetry';

/** MobileTabId
 * @description All tab IDs in the mobile workspace bottom bar.
 *  Includes 5 data panels plus the Pilot nav action.
 */
export type MobileTabId = MobileDataPanelId | 'pilot';
