import type { DataCardProps } from './DataCard.types';
import { Show } from './Show';
import { StatusIndicator } from './StatusIndicator';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function DataCard({
  title,
  children,
  status,
  className,
  headerActions,
}: DataCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <span>{title}</span>
          <Show when={status !== undefined}>
            {status !== undefined && <StatusIndicator state={status} />}
          </Show>
        </CardTitle>
        <Show when={headerActions !== undefined}>
          <CardAction>{headerActions}</CardAction>
        </Show>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">{children}</CardContent>
    </Card>
  );
}
