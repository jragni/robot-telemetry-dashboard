import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useRef, useState, useCallback } from 'react';
import {
  Responsive,
  useContainerWidth,
  type Layout,
  type LayoutItem,
} from 'react-grid-layout';

import { PanelFrame } from './PanelFrame';

import type { ViewId } from '@/features/panels/panel.types';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/stores/layout.store';

// ---------------------------------------------------------------------------
// Grid configuration
// ---------------------------------------------------------------------------

const BREAKPOINTS = { lg: 1200, md: 768, sm: 0 } as const;
const COLS = { lg: 12, md: 6, sm: 2 } as const;
const ROW_HEIGHT = 60;

type Breakpoint = keyof typeof BREAKPOINTS;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PanelGridProps {
  viewId: ViewId;
  className?: string;
  robotId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PanelGrid({ viewId, className, robotId }: PanelGridProps) {
  const viewLayout = useLayoutStore((s) => s.getViewLayout(viewId));
  const editMode = useLayoutStore((s) => s.editMode);

  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerWidth({ ref: containerRef });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');

  const isMobileBreakpoint = currentBreakpoint === 'sm';
  const canInteract = editMode && !isMobileBreakpoint;

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

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      {width > 0 && (
        <Responsive
          className="layout"
          width={width}
          layouts={breakpoints}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          compactType="vertical"
          isDraggable={canInteract}
          isResizable={canInteract}
          draggableHandle=".panel-drag-handle"
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={handleBreakpointChange}
          margin={[8, 8]}
          containerPadding={[0, 0]}
        >
          {panels.map((instance) => (
            <div key={instance.id}>
              <PanelFrame
                instance={instance}
                viewId={viewId}
                editMode={editMode}
                robotId={robotId}
              />
            </div>
          ))}
        </Responsive>
      )}
    </div>
  );
}
