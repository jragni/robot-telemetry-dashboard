import { Radio } from 'lucide-react';

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
      <p className="font-mono text-xs text-text-muted max-w-[340px] text-center leading-relaxed">
        Add your first robot to begin monitoring. Connect to any ROS2 robot
        running rosbridge.
      </p>
      <button
        type="button"
        onClick={onAddRobot}
        className="font-sans text-sm font-semibold uppercase tracking-wide px-8 py-3 bg-transparent text-accent border border-accent rounded-sm cursor-pointer transition-all duration-200 hover:bg-accent-subtle hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        Add Robot
      </button>
    </div>
  );
}
