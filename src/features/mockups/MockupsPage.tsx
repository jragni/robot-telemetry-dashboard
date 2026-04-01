import { useCallback } from 'react';
import { MOCK_SECTIONS } from './constants';
import { useScrollSpy } from './hooks/useScrollSpy';
import { MockupSection } from './components/MockupSection';
import { ColorSwatches } from './components/ColorSwatches';
import { TypographyScale } from './components/TypographyScale';
import { SpacingScale } from './components/SpacingScale';
import { StatusIndicators } from './components/StatusIndicators';
import { ButtonShowcase } from './components/ButtonShowcase';
import { PanelShowcase } from './components/PanelShowcase';
import { IconGrid } from './components/IconGrid';
import { BorderEffects } from './components/BorderEffects';
import { EmptyStates } from './components/EmptyStates';
import { AnimationShowcase } from './components/AnimationShowcase';

/** SECTION_IDS
 * @description Stable array of section IDs for the scrollspy hook.
 */
const SECTION_IDS = MOCK_SECTIONS.map((s) => s.id);

/** SECTION_COMPONENTS
 * @description Maps each section ID to its corresponding component.
 */
const SECTION_COMPONENTS: Record<string, React.ReactNode> = {
  colors: <ColorSwatches />,
  typography: <TypographyScale />,
  spacing: <SpacingScale />,
  status: <StatusIndicators />,
  buttons: <ButtonShowcase />,
  panels: <PanelShowcase />,
  icons: <IconGrid />,
  borders: <BorderEffects />,
  empty: <EmptyStates />,
  animations: <AnimationShowcase />,
};

/** MockupsPage
 * @description Renders the design system mockups page with a sticky left nav
 *  featuring scrollspy highlighting and all design system sections. Fully
 *  self-contained state — no external stores.
 */
export function MockupsPage() {
  const activeId = useScrollSpy(SECTION_IDS);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      <nav
        className="w-48 shrink-0 border-r border-border bg-surface-primary overflow-y-auto py-4 px-2 sticky top-0 h-full"
        aria-label="Mockups page navigation"
      >
        <h1 className="font-sans text-sm font-semibold text-text-primary px-2 mb-4">
          Design System
        </h1>
        <ul className="flex flex-col gap-0.5">
          {MOCK_SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => {
                  scrollToSection(section.id);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-sm font-sans text-xs cursor-pointer transition focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px] ${
                  activeId === section.id
                    ? 'text-accent bg-accent-subtle font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-accent-subtle'
                }`}
                aria-current={activeId === section.id ? 'true' : undefined}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-1 overflow-y-auto" role="main">
        {MOCK_SECTIONS.map((section) => (
          <MockupSection
            key={section.id}
            id={section.id}
            title={section.title}
            description={section.description}
          >
            {SECTION_COMPONENTS[section.id]}
          </MockupSection>
        ))}
      </main>
    </div>
  );
}
