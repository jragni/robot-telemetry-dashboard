import { useEffect, useState, useRef, useCallback } from 'react';

import { TableCell, TableRow } from '@/components/ui/table';
import { TopicTableRowProps } from './definitions';

import { formatFullMessage } from './helpers';

export default function TopicTableRow({
  messageType,
  selectedConnection,
  topicName,
}: TopicTableRowProps): React.ReactNode {
  const ros = selectedConnection?.rosInstance;
  const [message, setMessage] = useState<string>('');
  const lastUpdateRef = useRef<number>(0);
  const pendingMessageRef = useRef<string>('');

  // Throttle updates to prevent UI freezing (max 2 updates per second)
  const throttleDelay = 500; // ms

  const throttledSetMessage = useCallback((newMessage: string) => {
    const now = Date.now();
    pendingMessageRef.current = newMessage;

    if (now - lastUpdateRef.current >= throttleDelay) {
      setMessage(newMessage);
      lastUpdateRef.current = now;
    } else {
      // Schedule update for later
      setTimeout(() => {
        if (pendingMessageRef.current) {
          setMessage(pendingMessageRef.current);
          lastUpdateRef.current = Date.now();
          pendingMessageRef.current = '';
        }
      }, throttleDelay - (now - lastUpdateRef.current));
    }
  }, [throttleDelay]);

  useEffect(() => {
    setMessage('');
    lastUpdateRef.current = 0;
    pendingMessageRef.current = '';

    const handleSubscribe = async () => {
      if (!ros) return;
      const ROSLIB = (await import('roslib')).default;

      const topic = new ROSLIB.Topic({
        ros,
        name: topicName,
        messageType,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = (m: any) => {
        try {
          const val = formatFullMessage(m);
          // Limit message size to prevent UI lag
          const maxLength = 10000;
          const truncatedVal = val.length > maxLength
            ? `${val.substring(0, maxLength)}\n... [Message truncated for performance]`
            : val;
          throttledSetMessage(truncatedVal);
        } catch (error) {
          console.warn('Error formatting message for topic', topicName, ':', error);
          throttledSetMessage('[Error formatting message]');
        }
      };
      topic.subscribe(handle);
    };

    handleSubscribe();
  }, [ros, topicName, messageType, throttledSetMessage]);

  return (
    <TableRow key={topicName}>
      <TableCell className="font-semibold text-xs sm:text-sm">
        <div className="break-all">{topicName}</div>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
        <div className="break-all">{messageType}</div>
      </TableCell>
      <TableCell className="sm:hidden text-xs">
        <div className="break-all" title={messageType}>
          {messageType.split('/').pop() ?? messageType}
        </div>
      </TableCell>
      <TableCell className="max-w-xs sm:max-w-md">
        <div className="font-mono text-xs overflow-auto h-32 whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-800 dark:text-gray-100 p-2 rounded">
          {message || 'No data received'}
        </div>
      </TableCell>
    </TableRow>
  );
}