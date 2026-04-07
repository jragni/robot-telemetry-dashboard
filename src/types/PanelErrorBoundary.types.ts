import type { ReactNode } from 'react';

export interface PanelErrorBoundaryProps {
  children: ReactNode;
}

export interface PanelErrorBoundaryState {
  hasError: boolean;
}
