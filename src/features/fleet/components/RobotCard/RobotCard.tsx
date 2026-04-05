import { useBatterySubscription } from '@/hooks/useBatterySubscription';
import { useRobotConnection } from '@/hooks/useRobotConnection';
import { useRosGraph } from '@/hooks/useRosGraph';
import { useRosTopics } from '@/hooks/useRosTopics';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

import { RobotCardActions } from './components/RobotCardActions';
import { RobotCardConnection } from './components/RobotCardConnection';
import { RobotCardGraph } from './components/RobotCardGraph';
import { RobotCardIdentity } from './components/RobotCardIdentity';
import { RobotCardVitals } from './components/RobotCardVitals';
import { ROBOT_COLOR_CLASSES } from './constants';
import type { RobotCardProps } from './types/RobotCard.types';

/** RobotCard
 * @description Displays a single robot's connection info, system diagnostics,
 *  and navigation actions.
 * @param robot - Robot connection data to display.
 * @param onRemove - Callback invoked with robot ID on removal confirmation.
 */
export function RobotCard({ robot, onRemove }: RobotCardProps) {
  const connectRobot = useConnectionStore((s) => s.connectRobot);
  const disconnectRobot = useConnectionStore((s) => s.disconnectRobot);
  const { ros } = useRobotConnection(robot.id);
  const topics = useRosTopics(ros);
  const rosGraph = useRosGraph(ros);
  const battery = useBatterySubscription(ros, topics);
  const borderColor = ROBOT_COLOR_CLASSES[robot.color].border;
  const iconColor = ROBOT_COLOR_CLASSES[robot.color].text;
  const isConnected = robot.status === 'connected';

  return (
    <Card
      className={`border-l-4 ${borderColor} rounded-sm bg-surface-primary shadow-glow-top p-0 gap-0`}
    >
      <CardHeader className="p-4 pb-0">
        <RobotCardIdentity name={robot.name} status={robot.status} iconColor={iconColor} />
      </CardHeader>

      <CardContent className="p-4 flex flex-col gap-3">
        <hr className="border-border" />
        <RobotCardConnection url={robot.url} lastSeen={robot.lastSeen} />
        <hr className="border-border border-dashed" />

        <RobotCardVitals battery={battery} />
        <hr className="border-border border-dashed" />

        <RobotCardGraph graph={rosGraph} isConnected={isConnected} />
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <RobotCardActions
          robotId={robot.id}
          robotName={robot.name}
          status={robot.status}
          onRemove={() => {
            onRemove(robot.id);
          }}
          onConnect={() => {
            void connectRobot(robot.id);
          }}
          onDisconnect={() => {
            disconnectRobot(robot.id);
          }}
        />
      </CardFooter>
    </Card>
  );
}
