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
    <section className="w-full p-4 m-2">
      <h2 className="font-extrabold">Topics</h2>
        {!subscriptions.length
          ? (<p>No data</p>)
          : (
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
          )}
      </section>
    );

}