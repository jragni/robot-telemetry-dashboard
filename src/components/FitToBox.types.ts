import type { ReactNode } from 'react';

export interface FitToBoxProps {
  readonly children: ReactNode;
  readonly minScale?: number;
  readonly maxScale?: number;
  readonly align?: 'top' | 'center';
}
