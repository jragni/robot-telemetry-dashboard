import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LidarTopicSelectorProps {
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  topics: string[];
  isConnected: boolean;
  compact?: boolean;
}

export function LidarTopicSelector({
  selectedTopic,
  onTopicChange,
  topics,
  isConnected,
  compact = false,
}: LidarTopicSelectorProps) {
  const triggerClassName = compact
    ? 'text-[13px] font-mono w-auto bg-card/90 backdrop-blur-sm text-gray-900 dark:text-[#E8E8E8] border-2 border-[#4A4A4A] hover:bg-[#1A1A1A] hover:border-[#6A6A6A] focus-visible:border-amber-600 transition-all'
    : 'text-[13px] font-mono w-auto bg-card text-gray-900 dark:text-[#E8E8E8] border-2 border-[#4A4A4A] hover:bg-[#1A1A1A] hover:border-[#6A6A6A] focus-visible:border-amber-600 transition-all';

  return (
    <Select
      value={selectedTopic}
      onValueChange={onTopicChange}
      disabled={!isConnected || topics.length === 0}
    >
      <SelectTrigger size="sm" className={triggerClassName}>
        <SelectValue placeholder="Select topic" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#E8E8E8] border-2 border-gray-300 dark:border-[#5A5A5A] shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <SelectItem
              key={topic}
              value={topic}
              className="text-[13px] font-mono hover:bg-gray-100 dark:hover:bg-[#1A1A1A] focus:bg-gray-100 dark:focus:bg-[#1A1A1A] data-[state=checked]:bg-emerald-100 dark:data-[state=checked]:bg-[#1A4D2E] data-[state=checked]:text-emerald-900 dark:data-[state=checked]:text-white data-[state=checked]:font-semibold data-[state=checked]:border-l-4 data-[state=checked]:border-l-emerald-500 transition-colors cursor-pointer"
            >
              {topic}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled className="text-[13px]">
            No LaserScan topics found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
