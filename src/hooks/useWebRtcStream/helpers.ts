/** applyBandwidthConstraint
 * @description Inserts a b=AS line after the m=video line in an SDP string
 *  to signal maximum video bitrate to the remote peer.
 * @param sdp - The SDP offer string.
 * @param maxBitrateKbps - Maximum bitrate in kbps.
 * @returns Modified SDP string with bandwidth constraint, or original if no m=video found.
 */
export function applyBandwidthConstraint(sdp: string, maxBitrateKbps: number): string {
  return sdp.replace(/m=video (.+)\r?\n/, `m=video $1\r\nb=AS:${String(maxBitrateKbps)}\r\n`);
}
