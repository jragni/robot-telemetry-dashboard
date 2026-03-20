import type { ReactNode } from 'react';

export interface ShowProps {
  when: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}
