import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TopicSelectorProps } from '../types/WorkspacePanel.types';

/** TopicSelector
 * @description Renders the topic name button with dropdown chevron for
 *  panel topic selection.
 * @param topicName - The ROS topic name to display.
 */
export function TopicSelector({ topicName }: TopicSelectorProps) {
  return (
    <Button
      variant="ghost"
      size="xs"
      aria-label="Topic options"
      className="ml-1 font-mono text-xs text-text-muted hover:text-accent truncate max-w-full"
    >
      {topicName}
      <ChevronDown className="size-3 shrink-0" />
    </Button>
  );
}
