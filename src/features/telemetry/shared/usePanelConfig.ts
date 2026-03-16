import { useMemo } from 'react';

import { useLayoutStore } from '@/stores/layout.store';

// ---------------------------------------------------------------------------
// usePanelConfig
// ---------------------------------------------------------------------------

/**
 * Reads the config record for a given panelId by searching across all views
 * in the layout store.
 *
 * Returns the config object (or undefined when the panel has no config /
 * cannot be found). Consumers cast the result to their own config shape.
 */
export function usePanelConfig(
  panelId: string
): Record<string, unknown> | undefined {
  const layouts = useLayoutStore((s) => s.layouts);

  return useMemo(() => {
    for (const viewLayout of Object.values(layouts)) {
      const found = viewLayout.panels.find((p) => p.id === panelId);
      if (found !== undefined) {
        return found.config;
      }
    }
    return undefined;
  }, [layouts, panelId]);
}
