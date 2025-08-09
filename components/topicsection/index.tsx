"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useConnection } from "@/components/dashboard/ConnectionProvider";

export default function TopicSection(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const subscriptions = selectedConnection?.subscriptions ?? [];

  return (
    <Table>
      <TableCaption>Topics</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Topic</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map(({ messageType, status, topicName}) => (
          <TableRow key={topicName}>
            <TableCell>{topicName}</TableCell>
            <TableCell>{messageType}</TableCell>
            <TableCell>{status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

}