import { useState, useCallback } from 'react';

import type { UseMinimizedPanelsReturn } from './useMinimizedPanels.types';

/** useMinimizedPanels
 * @description Manages minimize/maximize state for workspace panels.
 *  Supports individual minimize, single-panel maximize, and restore-all.
 * @param allIds - All panel IDs in the workspace grid.
 */
export function useMinimizedPanels(allIds: readonly string[]): UseMinimizedPanelsReturn {
  const [minimized, setMinimized] = useState(new Set<string>());
  const [maximizedId, setMaximizedId] = useState<string | null>(null);

  const isMinimized = useCallback((id: string) => minimized.has(id), [minimized]);

  const isMaximized = useCallback((id: string) => maximizedId === id, [maximizedId]);

  const minimize = useCallback((id: string) => {
    setMaximizedId(null);
    setMinimized((prev) => new Set([...prev, id]));
  }, []);

  const restore = useCallback((id: string) => {
    setMaximizedId(null);
    setMinimized((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const maximize = useCallback(
    (id: string) => {
      setMaximizedId(id);
      setMinimized(new Set(allIds.filter((panelId) => panelId !== id)));
    },
    [allIds],
  );

  const restoreAll = useCallback(() => {
    setMaximizedId(null);
    setMinimized(new Set());
  }, []);

  return {
    isMinimized,
    isMaximized,
    minimize,
    restore,
    maximize,
    restoreAll,
    minimizedIds: minimized,
    maximizedId,
  };
}
