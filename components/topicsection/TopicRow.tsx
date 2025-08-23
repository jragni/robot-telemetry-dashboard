'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface TopicMessage {
  [key: string]: unknown;
}

interface TopicRowProps {
  topicName: string;
  messageType: string;
  connection: {
    ros?: unknown;
  } | null;
  isHeavy?: boolean;
}

export default function TopicRow({ topicName, messageType, connection, isHeavy = false }: TopicRowProps) {
  const [message, setMessage] = useState<TopicMessage | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    if (!connection?.ros || isHeavy) {
      setIsLoading(false);
      return;
    }

    const subscribe = () => {
      try {
        const topic = new (window as any).ROSLIB.Topic({
          ros: connection.ros,
          name: topicName,
          messageType,
        });

        let count = 0;
        subscriptionRef.current = topic;

        topic.subscribe((msg: TopicMessage) => {
          setMessage(msg);
          count++;
          setMessageCount(count);
          setIsLoading(false);
        });
      } catch {
        setIsLoading(false);
      }
    };

    subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [connection, topicName, messageType, isHeavy]);

  const formatMessage = (msg: TopicMessage | null) => {
    if (!msg) return 'No data';
    if (isHeavy) return 'Heavy topic (disabled)';
    try {
      return JSON.stringify(msg, null, 2);
    } catch {
      return String(msg);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-mono text-xs sm:text-sm min-w-[200px]">
        <div className="truncate" title={topicName}>
          {topicName}
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs sm:text-sm text-muted-foreground min-w-[200px]">
        <div className="truncate" title={messageType}>
          {messageType}
        </div>
      </TableCell>
      <TableCell className="min-w-[300px]">
        <pre className={cn(
          'font-mono text-xs p-2 rounded bg-muted/30 overflow-auto max-h-20',
          isHeavy && 'text-center text-muted-foreground',
        )}>
          {isLoading ? 'Loading...' : formatMessage(message)}
        </pre>
        {!isHeavy && messageCount > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            Messages: {messageCount}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}