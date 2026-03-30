import type { ReactElement } from 'react';

export interface ConditionalRenderProps {
  readonly Component: ReactElement;
  readonly shouldRender: boolean;
}
