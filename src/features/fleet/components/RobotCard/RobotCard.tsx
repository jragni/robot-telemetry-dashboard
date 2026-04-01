import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { RobotCardProps } from './types/RobotCard.types';
import { ROBOT_COLOR_CLASSES } from './constants';
import { RobotCardIdentity } from './components/RobotCardIdentity';
import { RobotCardConnection } from './components/RobotCardConnection';
import { RobotCardVitals } from './components/RobotCardVitals';
import { RobotCardGraph } from './components/RobotCardGraph';
import { RobotCardActions } from './components/RobotCardActions';

/** RobotCard
 * @description Displays a single robot's connection info, system diagnostics,
 *  and navigation actions.
 * @param robot - Robot connection data to display.
 * @param onRemove - Callback invoked with robot ID on removal confirmation.
 */
export function RobotCard({ robot, onRemove }: RobotCardProps) {
  const borderColor = ROBOT_COLOR_CLASSES[robot.color].border;
  const iconColor = ROBOT_COLOR_CLASSES[robot.color].text;
  const isConnected = robot.status === 'connected';

  return (
    <Card
      className={`border-l-4 ${borderColor} rounded-sm bg-surface-primary shadow-glow-top p-0 gap-0`}
    >
      <CardHeader className="p-4 pb-0">
        <RobotCardIdentity
          name={robot.name}
          status={robot.status}
          iconColor={iconColor}
        />
      </CardHeader>

      <CardContent className="p-4 flex flex-col gap-3">
        <hr className="border-border" />
        <RobotCardConnection url={robot.url} lastSeen={robot.lastSeen} />
        <hr className="border-border border-dashed" />

        <ConditionalRender
          shouldRender={isConnected}
          Component={
            <>
              <RobotCardVitals />
              <hr className="border-border border-dashed" />
            </>
          }
        />

        <RobotCardGraph isConnected={isConnected} />
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <RobotCardActions
          robotId={robot.id}
          robotName={robot.name}
          status={robot.status}
          onRemove={() => {
            onRemove(robot.id);
          }}
        />
      </CardFooter>
    </Card>
  );
}
