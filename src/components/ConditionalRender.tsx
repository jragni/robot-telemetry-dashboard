import { isValidElement } from 'react';
import type { ConditionalRenderProps } from '@/types/ConditionalRender.types';

/**
 * Renders a component or element conditionally based on shouldRender.
 * Returns null when shouldRender is false.
 * @param Component - A React component type or JSX element to render.
 * @param shouldRender - Whether to render the component.
 * @param propsToPassDown - Props forwarded to Component when it is
 *   a component type (ignored for JSX elements).
 */
export function ConditionalRender<P = Record<string, unknown>>({
  Component,
  shouldRender,
  propsToPassDown,
}: ConditionalRenderProps<P>) {
  if (!shouldRender) return null;

  if (isValidElement(Component)) {
    return Component;
  }

  const Comp = Component;
  return propsToPassDown ? <Comp {...propsToPassDown} /> : <Comp />;
}
