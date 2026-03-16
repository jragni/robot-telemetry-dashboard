import type { ReactNode } from 'react';

import type { ConnectionState } from '@/types';

export interface DataCardProps {
  title: string;
  children: ReactNode;
  status?: ConnectionState;
  className?: string;
  headerActions?: ReactNode;
}
