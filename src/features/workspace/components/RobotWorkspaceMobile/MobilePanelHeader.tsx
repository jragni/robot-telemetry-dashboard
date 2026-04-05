import { TopicSelector } from '../TopicSelector';
import type { MobilePanelHeaderProps } from './RobotWorkspaceMobile.types';

/** MobilePanelHeader
 * @description Renders the header bar for the active mobile workspace panel,
 *  showing the panel icon, label, and an optional topic selector for panels
 *  that support topic switching.
 * @param icon - Lucide icon component for the active panel.
 * @param activeLabel - Display label for the active panel.
 * @param activePanel - Currently active panel identifier.
 * @param activeFilteredTopics - Available ROS topics for the active panel.
 * @param activeTopicName - Currently selected topic name.
 * @param onTopicChange - Callback when topic selection changes.
 * @param showTopicSelector - Whether to show the topic selector dropdown.
 */
export function MobilePanelHeader({
  activeFilteredTopics,
  activeLabel,
  activePanel,
  activeTopicName,
  icon: ActiveIcon,
  onTopicChange,
  showTopicSelector,
}: MobilePanelHeaderProps) {
  return (
    <header className="flex items-center gap-2 px-3 h-10 shrink-0 border-b border-border bg-surface-primary">
      {ActiveIcon ? (
        <ActiveIcon className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
      ) : null}
      <span className="font-mono text-xs font-semibold text-text-secondary uppercase tracking-widest">
        {activeLabel}
      </span>
      {showTopicSelector && activeTopicName ? (
        <div className="min-w-0 shrink">
          <TopicSelector
            topicName={activeTopicName}
            availableTopics={activeFilteredTopics}
            onTopicChange={(t) => { onTopicChange(activePanel, t); }}
          />
        </div>
      ) : null}
    </header>
  );
}
