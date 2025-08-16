'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import StaticTopicTableRow from './StaticTopicTableRow';
import TopicTableRow from './TopicTableRow';

export default function TopicSection(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const allSubscriptions = selectedConnection?.subscriptions ?? [];

  // Filter out heavy data types that can slow down the app
  const heavyDataTypes = [
    'sensor_msgs/msg/Image',
    'sensor_msgs/msg/CompressedImage',
    'sensor_msgs/msg/PointCloud2',
    'sensor_msgs/msg/PointCloud',
    'visualization_msgs/msg/MarkerArray',
    'nav_msgs/msg/OccupancyGrid',
  ];

  const lightSubscriptions = allSubscriptions.filter(sub =>
    !heavyDataTypes.includes(sub.messageType),
  );

  const heavySubscriptions = allSubscriptions.filter(sub =>
    heavyDataTypes.includes(sub.messageType),
  );

  const totalSubscriptions = lightSubscriptions.length + heavySubscriptions.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Topics</CardTitle>
        {heavySubscriptions.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {heavySubscriptions.length} heavy data topic{heavySubscriptions.length > 1 ? 's' : ''} shown without live updates for performance
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!totalSubscriptions
          ? (<p className="text-sm text-muted-foreground">No data</p>)
          : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold min-w-32">Topic</TableHead>
                    <TableHead className="font-semibold min-w-24 sm:table-cell">Type</TableHead>
                    <TableHead className="font-semibold min-w-48">Raw Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lightSubscriptions.map((props) => (
                    <TopicTableRow
                      key={props.topicName}
                      selectedConnection={selectedConnection}
                      {...props}
                    />
                  ))}
                  {heavySubscriptions.map((props) => (
                    <StaticTopicTableRow
                      key={props.topicName}
                      messageType={props.messageType}
                      topicName={props.topicName}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
      </CardContent>
    </Card>
  );
}