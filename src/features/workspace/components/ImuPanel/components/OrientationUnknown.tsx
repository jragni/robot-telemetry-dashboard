import { NavigationOff } from 'lucide-react';

/** OrientationUnknown
 * @description Loss-of-fix state for the IMU panel — shown when the robot is
 *  connected but the orientation quaternion is null. Replaces the attitude
 *  visualization so the operator never reads a confidently-wrong level horizon.
 */
export function OrientationUnknown() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-[clamp(0.25rem,2cqmin,0.5rem)] py-[clamp(0.5rem,4cqmin,2rem)] text-center"
      role="status"
      aria-label="Orientation unknown — IMU is not reporting orientation data"
    >
      <NavigationOff
        className="size-[clamp(1.5rem,12cqmin,2.25rem)] text-text-muted opacity-30"
        strokeWidth={1.5}
      />
      <p className="font-sans text-[clamp(0.75rem,3.5cqmin,1rem)] font-semibold text-text-primary">
        Orientation unknown
      </p>
      <p className="font-mono text-[clamp(0.625rem,2.8cqmin,0.875rem)] text-text-muted max-w-60">
        IMU is not reporting orientation data
      </p>
    </div>
  );
}
