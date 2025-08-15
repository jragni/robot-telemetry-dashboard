"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useConnection } from "@/components/dashboard/ConnectionProvider";
import TopicTableRow from "./TopicTableRow";

export default function TopicSection(): React.ReactNode {
  const [hideRawMessage, setHideRawMessage] = useState<boolean>(true);
  const { selectedConnection } = useConnection();
  const subscriptions = selectedConnection?.subscriptions ?? [];

  return (
    <section className="p-2 sm:p-4 m-2">
      <h2 className="font-extrabold my-2">Topics</h2>
      {!subscriptions.length
        ? (<p className="font-bold">No data</p>)
        : (
          <>
            <Button
              onClick={() => setHideRawMessage(!hideRawMessage)}
              className="mb-4 text-xs sm:text-sm"
              size="sm"
            >
              {hideRawMessage ? "Show Raw Messages" : "Hide Raw Messages"}
            </Button>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-extrabold underline min-w-32">Topic</TableHead>
                    <TableHead className="font-extrabold underline min-w-24 hidden sm:table-cell">Type</TableHead>
                    <TableHead className="font-extrabold underline sm:hidden">T</TableHead>
                    { !hideRawMessage && <TableHead className="font-extrabold underline min-w-48">Raw Message</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((props) => (
                    <TopicTableRow
                      key={props.topicName}
                      hideRawMessage={hideRawMessage}
                      selectedConnection={selectedConnection}
                      {...props}
                      />
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
    </section>
  );
}