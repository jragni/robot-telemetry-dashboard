import type { TopicSelectorProps } from './definitions';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAvailableControlTopics } from '@/hooks/control/useAvailableControlTopics';

function TopicSelector({ selectedTopic, onTopicChange }: TopicSelectorProps) {
  const { topics, isLoading } = useAvailableControlTopics();

  return (
    <div className="mb-3">
      <Select
        value={selectedTopic}
        onValueChange={onTopicChange}
        disabled={isLoading}
      >
        <SelectTrigger className="h-8 text-[13px] font-mono bg-card text-gray-900 dark:text-[#E8E8E8] border-2 border-[#4A4A4A] hover:bg-[#1A1A1A] hover:border-[#6A6A6A] focus-visible:border-amber-600 transition-all">
          <SelectValue
            placeholder={isLoading ? 'Loading...' : 'Select topic'}
          />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#E8E8E8] border-2 border-gray-300 dark:border-[#5A5A5A] shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
          {topics.map((topic) => (
            <SelectItem
              key={topic.value}
              value={topic.value}
              className="text-[13px] font-mono hover:bg-gray-100 dark:hover:bg-[#1A1A1A] focus:bg-gray-100 dark:focus:bg-[#1A1A1A] data-[state=checked]:bg-emerald-100 dark:data-[state=checked]:bg-[#1A4D2E] data-[state=checked]:text-emerald-900 dark:data-[state=checked]:text-white data-[state=checked]:font-semibold data-[state=checked]:border-l-4 data-[state=checked]:border-l-emerald-500 transition-colors cursor-pointer"
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
