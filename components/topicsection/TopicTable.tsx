'use client';

import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TopicRow from './TopicRow';

interface Subscription {
  topicName: string;
  messageType: string;
}

interface TopicTableProps {
  subscriptions: Subscription[];
  selectedConnection: {
    ros?: unknown;
  } | null;
  isHeavyTopic: (messageType: string) => boolean;
}

export default function TopicTable({
  subscriptions,
  selectedConnection,
  isHeavyTopic,
}: TopicTableProps) {
  return (
    <div
      className="overflow-x-auto"
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        WebkitOverflowScrolling: 'touch',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Topic</TableHead>
            <TableHead className="font-medium">Type</TableHead>
            <TableHead className="font-medium min-w-[300px]">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TopicRow
              key={sub.topicName}
              connection={selectedConnection}
              isHeavy={isHeavyTopic(sub.messageType)}
              messageType={sub.messageType}
              topicName={sub.topicName}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}