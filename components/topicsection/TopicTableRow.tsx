import { useEffect, useState, useRef, useCallback } from 'react';

import { TableCell, TableRow } from '@/components/ui/table';
import { TopicTableRowProps } from './definitions';

import { formatFullMessage, formatSensorMessage } from './helpers';

interface ROSTopicSubscription {
  subscribe: (callback: (message: unknown) => void) => void;
  unsubscribe: () => void;
}

interface ExtendedTopicTableRowProps extends TopicTableRowProps {
  isActive?: boolean;
}

export default function TopicTableRow({
  messageType,
  selectedConnection,
  topicName,
  isActive = true,
}: ExtendedTopicTableRowProps): React.ReactNode {
  const ros = selectedConnection?.rosInstance;
  const [message, setMessage] = useState<string>('');
  const lastUpdateRef = useRef<number>(0);
  const pendingMessageRef = useRef<string>('');

  // NO THROTTLING - display all messages in real-time
  const getThrottleDelay = useCallback((_messageType: string) => {
    return 0; // No delay for any message type - real-time updates
  }, []);

  const throttleDelay = getThrottleDelay(messageType);

  const throttledSetMessage = useCallback((newMessage: string) => {
    if (throttleDelay === 0) {
      // No throttling - immediate update
      setMessage(newMessage);
      return;
    }

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
    // Reset message state
    setMessage('');
    lastUpdateRef.current = 0;
    pendingMessageRef.current = '';

    // Only subscribe when component is active
    if (!isActive) {
      setMessage('Table collapsed - no live updates');
      return;
    }

    let topicSubscription: ROSTopicSubscription | null = null;

    const handleSubscribe = async () => {
      if (!ros) return;
      const ROSLIB = (await import('roslib')).default;

      topicSubscription = new ROSLIB.Topic({
        ros,
        name: topicName,
        messageType,
      });

      const handle = (m: unknown) => {
        try {
          // Use fast formatter for sensor data, full formatter for others
          const isSensorData = messageType.includes('LaserScan') ||
                              messageType.includes('Imu') ||
                              messageType.includes('Image') ||
                              messageType.includes('CompressedImage') ||
                              messageType.includes('Twist');

          const val = isSensorData ? formatSensorMessage(m, messageType) : formatFullMessage(m);

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
      topicSubscription.subscribe(handle);
    };

    handleSubscribe();

    // Cleanup function to unsubscribe when component unmounts or becomes inactive
    return () => {
      if (topicSubscription) {
        topicSubscription.unsubscribe();
      }
    };
  }, [ros, topicName, messageType, throttledSetMessage, isActive]);

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