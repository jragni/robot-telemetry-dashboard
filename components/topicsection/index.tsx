"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useConnection } from "@/components/dashboard/ConnectionProvider";
import TopicTableRow from "./TopicTableRow";

export default function TopicSection(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const subscriptions = selectedConnection?.subscriptions ?? [];

  return (
    <Table>
      <TableCaption>Topics</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="font-extrabold underline">Topic</TableHead>
          <TableHead className="font-extrabold underline">Type</TableHead>
          <TableHead className="font-extrabold underline">Raw Message</TableHead>
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
  );

}