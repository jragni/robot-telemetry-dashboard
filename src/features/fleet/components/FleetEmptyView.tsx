import { Radio } from 'lucide-react';
import { AddRobotModal } from './AddRobotModal/AddRobotModal';

/** FleetEmptyView
 * @description Renders the centered empty state when no robots are connected,
 *  with Add Robot CTA.
 */
export function FleetEmptyView() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center gap-6 py-24 px-8">
      <Radio size={36} className="text-accent opacity-30" />
      <h2 className="font-sans text-xl font-semibold text-text-primary">
        No Robots Configured
      </h2>
      <p className="font-sans text-xs text-text-muted max-w-85 text-center leading-relaxed">
        Add your first robot to begin monitoring. Connect to any ROS2 robot
        running rosbridge.
      </p>
      <AddRobotModal />
    </section>
  );
}
