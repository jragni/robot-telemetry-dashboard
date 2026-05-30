import { NavigationOff } from 'lucide-react';

/** OrientationUnknown
 * @description Loss-of-fix state for the IMU panel — shown when the robot is
 *  connected but the orientation quaternion is null. Replaces the attitude
 *  visualization so the operator never reads a confidently-wrong level horizon.
 */
export function OrientationUnknown() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 py-8 text-center"
      role="status"
      aria-label="Orientation unknown — IMU is not reporting orientation data"
    >
      <NavigationOff className="size-9 text-text-muted opacity-30" strokeWidth={1.5} />
      <p className="font-sans text-sm font-semibold text-text-primary">Orientation unknown</p>
      <p className="font-mono text-xs text-text-muted max-w-60">
        IMU is not reporting orientation data
      </p>
    </div>
  );
}
