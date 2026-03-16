import type { ReactNode } from 'react';

import type { ConnectionState } from '@/types/connection.types';

export interface DataCardProps {
  title: string;
  children: ReactNode;
  status?: ConnectionState;
  className?: string;
  headerActions?: ReactNode;
}
