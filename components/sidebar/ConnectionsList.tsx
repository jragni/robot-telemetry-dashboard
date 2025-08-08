"use client"

import { Card, CardContent } from "@/components/ui/card";
import { RobotConnection } from "@/components/dashboard/definitions";
import ConnnectionListItem from "./ConnectionsListItem";


/**
 * ConnectonsList
 */
export default function ConnectionsList({ connections }: { connections: RobotConnection[]}) {

  return (
    <Card>
      <CardContent>
        <ul>
          {connections.map(({ id, name, status }) => (
            <ConnnectionListItem key={id} id={id} name={name} status={status}/>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}