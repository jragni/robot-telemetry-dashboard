import { SPACING_SCALE } from '../constants';

/** SpacingScale
 * @description Renders visual bars at each spacing increment (4-64px) with
 *  accent-colored fills and Tailwind class labels.
 */
export function SpacingScale() {
  return (
    <div className="flex flex-col gap-3">
      {SPACING_SCALE.map((step) => (
        <div key={step.px} className="flex items-center gap-4">
          <span className="font-mono text-xs text-text-muted w-16 shrink-0 text-right">
            {String(step.px)}px
          </span>
          <div
            className="h-4 rounded-sm bg-accent"
            style={{ width: `${String(step.px * 4)}px` }}
          />
          <span className="font-mono text-xs text-text-secondary">{step.tailwindClass}</span>
        </div>
      ))}
    </div>
  );
}
