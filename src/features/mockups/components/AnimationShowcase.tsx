import { ANIMATION_LIST } from '../constants';

/** AnimationShowcase
 * @description Renders demo boxes for each animation pattern (pulse, spin,
 *  bounce, ping) with labels showing the Tailwind class name.
 */
export function AnimationShowcase() {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {ANIMATION_LIST.map((anim) => (
        <div key={anim.label} className="flex flex-col items-center gap-3">
          <div className="h-24 w-full flex items-center justify-center bg-surface-secondary rounded-sm border border-border">
            <div
              className={`size-6 rounded-full bg-accent ${anim.className}`}
              aria-hidden="true"
            />
          </div>
          <span className="font-mono text-xs text-text-secondary text-center">{anim.label}</span>
        </div>
      ))}
    </div>
  );
}
