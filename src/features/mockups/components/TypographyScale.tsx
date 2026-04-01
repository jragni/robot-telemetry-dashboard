import { TYPOGRAPHY_SAMPLES } from '../constants';

/** FONT_FAMILIES
 * @description The two permitted font families.
 */
const FONT_FAMILIES = [
  { name: 'Exo (font-sans)', className: 'font-sans' },
  { name: 'Roboto Mono (font-mono)', className: 'font-mono' },
] as const;

/** FONT_WEIGHTS
 * @description The two permitted font weights.
 */
const FONT_WEIGHTS = [
  { label: '400', className: 'font-normal' },
  { label: '600', className: 'font-semibold' },
] as const;

/** TypographyScale
 * @description Renders a grid of all permitted typography combinations:
 *  4 sizes (12/14/20/36px) across 2 fonts (Exo, Roboto Mono) and 2 weights
 *  (400, 600). Each row shows the sample text with its size label.
 */
export function TypographyScale() {
  return (
    <div className="flex flex-col gap-8">
      {FONT_FAMILIES.map((font) => (
        <div key={font.name}>
          <h3 className="font-sans text-sm font-semibold text-text-secondary mb-3">
            {font.name}
          </h3>
          <div className="flex flex-col gap-4">
            {FONT_WEIGHTS.map((weight) => (
              <div key={weight.label}>
                <span className="font-mono text-xs text-text-muted mb-2 block">
                  Weight: {weight.label}
                </span>
                <div className="flex flex-col gap-2">
                  {TYPOGRAPHY_SAMPLES.map((sample) => (
                    <div
                      key={`${font.name}-${weight.label}-${String(sample.sizePx)}`}
                      className="flex items-baseline gap-4"
                    >
                      <span className="font-mono text-xs text-text-muted w-32 shrink-0">
                        {sample.label}
                      </span>
                      <span
                        className={`${sample.tailwindClass} ${font.className} ${weight.className} text-text-primary`}
                      >
                        The quick brown fox
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
