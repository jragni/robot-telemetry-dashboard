import { AVAILABLE_CONTROL_TOPICS } from './constants';
import type { TopicSelectorProps } from './definitions';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function TopicSelector({ selectedTopic, onTopicChange }: TopicSelectorProps) {
  return (
    <div className="mb-3">
      <Select value={selectedTopic} onValueChange={onTopicChange}>
        <SelectTrigger className="h-8 text-xs font-mono bg-card text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-black text-white dark:bg-slate-900 dark:text-slate-100">
          {AVAILABLE_CONTROL_TOPICS.map((topic) => (
            <SelectItem
              key={topic.value}
              value={topic.value}
              className="text-xs font-mono"
            >
              {topic.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default TopicSelector;
