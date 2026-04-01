import { Button } from '@/components/ui/button';
import { BUTTON_VARIANTS } from '../constants';

/** ButtonShowcase
 * @description Renders all shadcn Button variants in both default and disabled
 *  states, arranged in a grid for visual comparison.
 */
export function ButtonShowcase() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-sans text-sm font-semibold text-text-secondary mb-3">Default</h3>
        <div className="flex flex-wrap gap-3">
          {BUTTON_VARIANTS.map((btn) => (
            <Button
              key={btn.label}
              variant={btn.variant}
              className="cursor-pointer transition"
            >
              <span className="font-sans text-sm">{btn.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-sans text-sm font-semibold text-text-secondary mb-3">Disabled</h3>
        <div className="flex flex-wrap gap-3">
          {BUTTON_VARIANTS.map((btn) => (
            <Button
              key={`${btn.label}-disabled`}
              variant={btn.variant}
              disabled
            >
              <span className="font-sans text-sm">{btn.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
