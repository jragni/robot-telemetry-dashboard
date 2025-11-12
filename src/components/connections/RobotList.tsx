/**
 * RobotList
 *
 * Displays the list of saved robots with selection and deletion capabilities.
 */

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { RobotConnection } from '@/contexts/ros/definitions';

interface RobotListProps {
  robots: RobotConnection[];
  activeRobotId: string | null;
  onSelectRobot: (robotId: string) => void;
  onDeleteRobot: (robot: RobotConnection) => void;
  onAddRobot: () => void;
}

export function RobotList({
  robots,
  activeRobotId,
  onSelectRobot,
  onDeleteRobot,
  onAddRobot,
}: RobotListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground">
          SAVED ROBOTS
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          {robots.length}
        </span>
      </div>

      {robots.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs font-mono text-muted-foreground mb-4">
            No robots added yet
          </p>
          <Button onClick={onAddRobot} size="sm" variant="outline">
            <Plus className="w-3 h-3 mr-1.5" />
            ADD YOUR FIRST ROBOT
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {robots.map((robot) => (
            <div
              key={robot.id}
              className={`group relative p-3 border rounded-sm transition-colors cursor-pointer ${
                robot.id === activeRobotId
                  ? 'border-primary bg-accent border-2'
                  : 'border-border hover:bg-accent/30'
              }`}
              onClick={() => onSelectRobot(robot.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectRobot(robot.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-semibold text-foreground truncate">
                    {robot.name}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {robot.url}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRobot(robot);
                  }}
                  className="h-6 w-6 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
                  aria-label={`Delete ${robot.name}`}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
