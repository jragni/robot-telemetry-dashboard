import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { TopicSelectorProps } from '../types/WorkspacePanel.types';

/** TopicSelector
 * @description Renders a topic dropdown that shows the current topic and lets
 *  users pick from available topics discovered on the robot.
 * @param topicName - The currently selected ROS topic name.
 * @param availableTopics - List of discovered topics from the robot.
 * @param onTopicChange - Callback when user selects a different topic.
 */
export function TopicSelector({ topicName, availableTopics, onTopicChange }: TopicSelectorProps) {
  const hasTopics = availableTopics && availableTopics.length > 0;

  if (!hasTopics || !onTopicChange) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          aria-label="Select topic"
          className="ml-1 font-mono text-xs text-text-muted hover:text-accent truncate max-w-full cursor-pointer"
        >
          {topicName}
          <ChevronDown className="size-3 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-60 overflow-y-auto bg-surface-primary border-border"
      >
        {availableTopics.map((topic) => (
          <DropdownMenuItem
            key={topic.name}
            onClick={() => { onTopicChange(topic.name); }}
            className={`font-mono text-xs cursor-pointer ${
              topic.name === topicName ? 'text-accent' : 'text-text-secondary'
            }`}
          >
            <span className="truncate">{topic.name}</span>
            <span className="ml-2 text-text-muted truncate">{topic.type}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
