import { Trash2 } from 'lucide-react';

interface RobotDeleteButtonProps {
  readonly robotName: string;
  readonly onRemove: () => void;
}

export function RobotDeleteButton({
  robotName,
  onRemove,
}: RobotDeleteButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      aria-label={`Remove ${robotName}`}
      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-text-muted bg-surface-tertiary border border-border rounded-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-status-critical hover:border-status-critical focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:opacity-100"
    >
      <Trash2 size={12} />
    </button>
  );
}
