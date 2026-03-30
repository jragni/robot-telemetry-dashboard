import { Link } from 'react-router-dom';
import { Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RobotCardActionsProps } from '../../types/RobotCardActions.types';
import { RobotDeleteButton } from './RobotDeleteButton';

/**
 * Renders the card action row with View, Pilot, and delete buttons.
 * @param robotId - Robot identifier for navigation links.
 * @param robotName - Robot name for delete button aria-label.
 * @param onRemove - Callback invoked when user confirms deletion.
 */
export function RobotCardActions({
  robotId,
  robotName,
  onRemove,
}: RobotCardActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="font-sans text-xs uppercase tracking-widest text-accent border-accent hover:bg-accent-subtle"
      >
        <Link to={`/robot/${robotId}`}>View</Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="font-sans text-xs uppercase tracking-widest text-text-secondary border-border hover:text-accent hover:border-accent"
      >
        <Link to={`/pilot/${robotId}`}>
          <Crosshair size={12} aria-hidden="true" />
          Pilot
        </Link>
      </Button>
      <div className="ml-auto">
        <RobotDeleteButton robotName={robotName} onRemove={onRemove} />
      </div>
    </div>
  );
}
