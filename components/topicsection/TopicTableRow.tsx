import { useEffect, useState } from 'react';

import { TableCell, TableRow } from '@/components/ui/table';
import { TopicTableRowProps } from './definitions';

import { formatMessage } from './helpers';

export default function TopicTableRow({
  messageType,
  selectedConnection,
  topicName,
}: TopicTableRowProps): React.ReactNode {
  const ros = selectedConnection?.rosInstance;
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    setMessage('');

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

        const val = formatMessage(m);
        setMessage(val);
      };
      topic.subscribe(handle);
    };

    handleSubscribe();
  }, [ros, topicName, messageType]);

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
        <div className="font-mono text-xs overflow-auto max-h-32 whitespace-pre-wrap break-words bg-gray-50 p-2 rounded">
          {message || 'No data received'}
        </div>
      </TableCell>
    </TableRow>
  );
}