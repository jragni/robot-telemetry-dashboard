'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import StaticTopicTableRow from './StaticTopicTableRow';
import TopicTableRow from './TopicTableRow';

export default function TopicSection(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const allSubscriptions = selectedConnection?.subscriptions ?? [];
  const [isExpanded, setIsExpanded] = useState(false);

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
    <Card className="w-full" data-testid="topic-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-lg">Topics</CardTitle>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            variant="ghost"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-xs">Expand ({totalSubscriptions})</span>
              </>
            )}
          </Button>
        </div>
        {isExpanded && heavySubscriptions.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {heavySubscriptions.length} heavy data topic{heavySubscriptions.length > 1 ? 's' : ''} shown without live updates for performance
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!totalSubscriptions ? (
          <p className="text-sm text-muted-foreground">No data</p>
        ) : !isExpanded ? (
          <p className="text-sm text-muted-foreground">
            {totalSubscriptions} topic{totalSubscriptions > 1 ? 's' : ''} available. Click expand to view.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold min-w-32 text-xs sm:text-sm">Topic</TableHead>
                  <TableHead className="font-semibold min-w-24 sm:table-cell text-xs sm:text-sm">Type</TableHead>
                  <TableHead className="font-semibold min-w-48 text-xs sm:text-sm">Raw Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lightSubscriptions.map((props) => (
                  <TopicTableRow
                    key={props.topicName}
                    isActive={isExpanded}
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