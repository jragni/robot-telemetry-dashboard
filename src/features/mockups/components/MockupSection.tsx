import type { MockupSectionProps } from '../types/MockupsPage.types';

/** MockupSection
 * @description Renders a reusable section wrapper with an id anchor, title,
 *  optional description, and consistent padding for the mockups page.
 * @prop id - The HTML id for scroll anchoring.
 * @prop title - The section heading text.
 * @prop description - Optional descriptive subtitle.
 * @prop children - The section content.
 */
export function MockupSection({ id, title, description, children }: MockupSectionProps) {
  return (
    <section id={id} className="border-b border-border py-8 px-6 last:border-b-0">
      <h2 className="font-sans text-xl font-semibold text-text-primary">{title}</h2>
      {description ? <p className="font-sans text-sm text-text-muted mt-1">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
