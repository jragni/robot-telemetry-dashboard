import type { ReactNode } from 'react';

import type { ConnectionState } from './StatusIndicator.types';

export interface DataCardProps {
  title: string;
  children: ReactNode;
  status?: ConnectionState;
  className?: string;
  headerActions?: ReactNode;
}
