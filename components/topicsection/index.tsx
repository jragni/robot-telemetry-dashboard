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
import TopicTableRow from './TopicTableRow';

export default function TopicSection(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const subscriptions = selectedConnection?.subscriptions ?? [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Topics</CardTitle>
      </CardHeader>
      <CardContent>
        {!subscriptions.length
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
                  {subscriptions.map((props) => (
                    <TopicTableRow
                      key={props.topicName}
                      selectedConnection={selectedConnection}
                      {...props}
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