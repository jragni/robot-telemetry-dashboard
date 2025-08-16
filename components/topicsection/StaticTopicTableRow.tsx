import { TableCell, TableRow } from '@/components/ui/table';
import { TopicTableRowProps } from './definitions';

export default function StaticTopicTableRow({
  messageType,
  topicName,
}: Omit<TopicTableRowProps, 'selectedConnection'>): React.ReactNode {
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
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-sm">Heavy data topic</p>
            <p className="text-xs">Live updates disabled for performance</p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}