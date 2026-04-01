import { BORDER_EFFECTS } from '../constants';

/** BorderEffects
 * @description Renders sample boxes demonstrating each panel border style and
 *  shadow-glow effect with their corresponding CSS class names.
 */
export function BorderEffects() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {BORDER_EFFECTS.map((effect) => (
        <div key={effect.label} className="flex flex-col gap-2">
          <div
            className={`${effect.className} rounded-sm bg-surface-secondary h-24 flex items-center justify-center`}
          >
            <span className="font-sans text-xs text-text-muted">Panel content</span>
          </div>
          <span className="font-mono text-xs text-text-secondary">{effect.label}</span>
        </div>
      ))}
    </div>
  );
}
