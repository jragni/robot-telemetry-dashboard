import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useState, useCallback, useMemo } from 'react';
import { Responsive, type Layout, type LayoutItem } from 'react-grid-layout';

import { PanelFrame } from './PanelFrame';
import { BREAKPOINTS, COLS, GRID_MARGIN } from './PanelGrid.constants';
import type { PanelGridProps } from './PanelGrid.types';

import { Show } from '@/components/shared/Show';
import { useElementSize } from '@/hooks/useElementSize';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/stores/layout/layout.store';

type Breakpoint = keyof typeof BREAKPOINTS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute the maximum row extent for the current breakpoint layout.
 * Each item occupies rows from `y` to `y + h`, so the grid's total
 * row count is the highest `y + h` across all items.
 */
function getMaxRow(layout: LayoutItem[]): number {
  return layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
}

/**
 * Derive a rowHeight that makes the default layout fit exactly within
 * the available container height, with no scroll required.
 *
 * Formula: availableHeight = (maxRows × rowHeight) + ((maxRows - 1) × marginY)
 * Solving:  rowHeight = (availableHeight - (maxRows - 1) × marginY) / maxRows
 *
 * Falls back to 60px if the container height is unknown or the layout is empty.
 */
function computeRowHeight(
  containerHeight: number,
  layout: LayoutItem[]
): number {
  const maxRows = getMaxRow(layout);
  if (maxRows === 0 || containerHeight <= 0) return 60;
  const totalMargin = (maxRows - 1) * GRID_MARGIN;
  const rowHeight = (containerHeight - totalMargin) / maxRows;
  return Math.max(rowHeight, 20);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PanelGrid({ viewId, className, robotId }: PanelGridProps) {
  const viewLayout = useLayoutStore((s) => s.getViewLayout(viewId));

  const [containerRef, { width, height }] = useElementSize<HTMLDivElement>();

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');

  const handleLayoutChange = useCallback(
    (_layout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
      const bpLayout = allLayouts[currentBreakpoint];
      if (bpLayout !== undefined) {
        useLayoutStore
          .getState()
          .setBreakpointLayouts(viewId, currentBreakpoint, [
            ...bpLayout,
          ] as LayoutItem[]);
      }
    },
    [viewId, currentBreakpoint]
  );

  const handleBreakpointChange = useCallback((breakpoint: string) => {
    setCurrentBreakpoint(breakpoint as Breakpoint);
  }, []);

  const { panels, breakpoints } = viewLayout;

  const rowHeight = useMemo(
    () => computeRowHeight(height, breakpoints[currentBreakpoint] ?? []),
    [height, breakpoints, currentBreakpoint]
  );

  return (
    <div ref={containerRef} className={cn('h-full w-full', className)}>
      <Show when={width > 0}>
        <Responsive
          className="layout"
          width={width}
          layouts={breakpoints}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={rowHeight}
          compactType="vertical"
          isDraggable={true}
          isResizable={true}
          resizeHandles={['nw', 'ne', 'sw', 'se']}
          draggableHandle=".panel-drag-handle"
          draggableCancel=".panel-action-button"
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={handleBreakpointChange}
          margin={[GRID_MARGIN, GRID_MARGIN]}
          containerPadding={[0, 0]}
        >
          {panels.map((instance) => (
            <div key={instance.id}>
              <PanelFrame
                instance={instance}
                viewId={viewId}
                robotId={robotId}
              />
            </div>
          ))}
        </Responsive>
      </Show>
    </div>
  );
}
