import { RobotConnection } from "../dashboard/definitions";
import { Card, CardContent } from "../ui/card";

// TODO Add the remove on click for this

/**
 * ConnectonsList
 */
export default function ConnectionsList({ connections }: { connections: RobotConnection[]}) {
  return (
    <Card>
      <CardContent>
        <ul>
          {connections.map(({ id, name }) => <li key={id}>{name}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}