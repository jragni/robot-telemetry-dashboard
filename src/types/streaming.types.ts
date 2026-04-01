/** VideoStreamStatus
 * @description WebRTC video stream connection states. Shared across features
 *  that consume video streams (Pilot, Fleet camera previews, etc.).
 */
export type VideoStreamStatus = 'idle' | 'connecting' | 'streaming' | 'reconnecting' | 'failed';
