import type { ConditionalRenderProps } from '@/types/ConditionalRender.types';

/**
 * @description ConditionalRender — Renders a JSX element conditionally.
 *  Returns null when shouldRender is false.
 * @param Component - The JSX element to render.
 * @param shouldRender - Whether to render the element.
 */
export function ConditionalRender({
  Component,
  shouldRender,
}: ConditionalRenderProps): React.ReactNode {
  if (!shouldRender) return null;
  return Component;
}
