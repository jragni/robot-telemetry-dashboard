import { useEffect, useState } from 'react';
// import ROSLIB from 'roslib';

import { TableCell, TableRow } from '@/components/ui/table';
import { RobotConnection } from '../dashboard/definitions';

interface TopicTableRowProps {
  hideRawMessage: boolean
  messageType: string;
  selectedConnection?: RobotConnection | null;
  topicName: string;
}

export default function TopicTableRow({
  hideRawMessage,
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
        const val =
          typeof m?.data !== 'undefined'
            ? String(m.data)
            : (() => {
                try {
                  return JSON.stringify(m);
                } catch {
                  return String(m);
                }
              })();
        setMessage(val);
      };
      topic.subscribe(handle);
    }

    handleSubscribe();
  }, [ros, topicName, messageType]);

  return (
    <TableRow key={topicName}>
      <TableCell className="font-semibold">{topicName}</TableCell>
      <TableCell>{messageType}</TableCell>
      {!hideRawMessage && <TableCell>{message}</TableCell>}
    </TableRow>
  );
}