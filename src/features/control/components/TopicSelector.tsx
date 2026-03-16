import { CONTROL_DEFAULT_TOPIC, CONTROL_MESSAGE_TYPE } from '../control.types';

import type { TopicSelectorProps } from './TopicSelector.types';

import { useControlStore } from '@/stores/control.store';
import { useRosStore } from '@/stores/ros.store';

// ---------------------------------------------------------------------------
// TopicSelector
// ---------------------------------------------------------------------------

/**
 * Dropdown that lets the operator pick which ROS topic the control pad
 * publishes Twist messages to.
 *
 * Only topics whose messageType is `geometry_msgs/Twist` are shown.
 * If no Twist topics are discovered the default `/cmd_vel` is still offered.
 */
export function TopicSelector({ robotId }: TopicSelectorProps) {
  const allTopics = robotId ? useRosStore.getState().getTopics(robotId) : [];
  const twistTopics = allTopics.filter(
    (t) => t.messageType === CONTROL_MESSAGE_TYPE
  );

  // Always include the default so the selector is never empty
  const options =
    twistTopics.length > 0
      ? twistTopics
      : [{ name: CONTROL_DEFAULT_TOPIC, messageType: CONTROL_MESSAGE_TYPE }];

  const selectedTopic = robotId
    ? useControlStore.getState().getControlState(robotId).selectedTopic
    : CONTROL_DEFAULT_TOPIC;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!robotId) return;
    useControlStore.getState().setSelectedTopic(robotId, e.target.value);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="topic-selector"
        className="text-xs text-muted-foreground uppercase tracking-wider"
      >
        Topic
      </label>
      <select
        id="topic-selector"
        aria-label="Command velocity topic"
        value={selectedTopic}
        onChange={handleChange}
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
      >
        {options.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
