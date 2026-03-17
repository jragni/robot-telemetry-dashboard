import type { ShowProps } from './Show.types';

// Pattern: <Show when={condition} fallback={<Fallback />}>{children}</Show>
// Inspired by SolidJS Show component
// Prevents: 0 && <Component> rendering "0", inconsistent conditional patterns

export function Show({ when, fallback = null, children }: ShowProps) {
  return when ? <>{children}</> : <>{fallback}</>;
}
