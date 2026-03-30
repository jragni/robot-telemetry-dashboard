import type { ReactElement, ComponentType } from 'react';

export interface ConditionalRenderProps<P = Record<string, unknown>> {
  readonly Component: ComponentType<P> | ReactElement;
  readonly shouldRender: boolean;
  readonly propsToPassDown?: P;
}
