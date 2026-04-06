import { MOBILE_TAB_META } from '@/features/workspace/constants';
import type { MobileTabBarProps } from './RobotWorkspaceMobile.types';

/** MobileTabBar
 * @description Renders the bottom navigation tab bar for mobile workspace.
 *  Displays icons and labels for each data panel plus a Pilot Mode action tab.
 *  Highlights the active panel and applies caution styling to the Pilot tab.
 * @prop activePanel - Currently active data panel identifier.
 * @prop onTabPress - Callback fired when a tab is pressed.
 */
export function MobileTabBar({ activePanel, onTabPress }: MobileTabBarProps) {
  return (
    <nav
      className="flex items-center shrink-0 border-t border-border bg-surface-primary"
      aria-label="Workspace panels"
    >
      {MOBILE_TAB_META.map((tab) => {
        const isActive = tab.id === activePanel;
        const isPilot = tab.id === 'pilot';

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              onTabPress(tab.id);
            }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 cursor-pointer transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none
              ${isActive ? 'text-accent border-t-2 border-accent' : 'text-text-muted border-t-2 border-transparent'}
              ${isPilot && !isActive ? 'text-status-caution' : ''}
            `}
            aria-label={isPilot ? 'Open Pilot Mode' : `Show ${tab.label} panel`}
            aria-current={isActive ? 'page' : undefined}
          >
            <tab.icon className="size-4" aria-hidden="true" />
            <span className="font-mono text-xs">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
