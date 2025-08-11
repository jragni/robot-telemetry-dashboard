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
    <section className="p-4 m-2">
      <h2 className="font-extrabold my-2">Topics</h2>
        {!subscriptions.length
          ? (<p>No data</p>)
          : (
            <>
              <Button onClick={() => setHideRawMessage(!hideRawMessage)} >
                {hideRawMessage ? "Expand Raw Message" : "Hide Raw Message"}</Button>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-extrabold underline">Topic</TableHead>
                    <TableHead className="font-extrabold underline">Type</TableHead>
                    { !hideRawMessage && <TableHead className="font-extrabold underline">Raw Message</TableHead>}
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
            </>
          )}
      </section>
    );

}