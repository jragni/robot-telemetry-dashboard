import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RobotDeleteButtonProps {
  readonly robotName: string;
  readonly onRemove: () => void;
}

export function RobotDeleteButton({
  robotName,
  onRemove,
}: RobotDeleteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      aria-label={`Remove ${robotName}`}
      className="absolute top-2 right-2 w-6 h-6 text-text-muted opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-status-critical hover:border-status-critical focus-visible:opacity-100"
    >
      <Trash2 size={12} />
    </Button>
  );
}
