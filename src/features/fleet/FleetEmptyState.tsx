import { Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FleetEmptyStateProps {
  readonly onAddRobot: () => void;
}

export function FleetEmptyState({ onAddRobot }: FleetEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 px-8">
      <Radio size={36} className="text-accent opacity-30" />
      <h2 className="font-sans text-xl font-semibold text-text-primary">
        No Robots Configured
      </h2>
      <p className="font-mono text-xs text-text-muted max-w-85 text-center leading-relaxed">
        Add your first robot to begin monitoring. Connect to any ROS2 robot
        running rosbridge.
      </p>
      <Button
        variant="outline"
        onClick={onAddRobot}
        className="uppercase tracking-wide text-accent border-accent hover:bg-accent-subtle"
      >
        Add Robot
      </Button>
    </div>
  );
}
