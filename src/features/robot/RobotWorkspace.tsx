import { Plus } from 'lucide-react';
import { useState, useCallback } from 'react';
import ReactGridLayout, { type LayoutItem } from 'react-grid-layout/legacy';
import { useParams } from 'react-router';

import { useRobotLayoutStore } from './robotLayoutStore';
import type { RobotWorkspaceProps } from './RobotWorkspace.types';

import { PanelFrame } from '@/features/dashboard/components/PanelFrame/PanelFrame';
import { PanelPicker } from '@/features/dashboard/components/PanelPicker/PanelPicker';
import { DEFAULT_ROBOT_LAYOUT } from '@/features/dashboard/registry/defaultLayouts';
import { panelRegistry } from '@/features/dashboard/registry/panelRegistry';
import { Show } from '@/shared/components/Show';
import { useElementSize } from '@/shared/hooks/useElementSize';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const HEADER_HEIGHT = 56;
const BOTTOM_PADDING = 16;
const GRID_ROWS = 10;

function computeRowHeight(containerHeight: number): number {
  if (containerHeight > 0) {
    return Math.floor((containerHeight - BOTTOM_PADDING) / GRID_ROWS);
  }
  return Math.floor(
    (window.innerHeight - HEADER_HEIGHT - BOTTOM_PADDING) / GRID_ROWS
  );
}

export function RobotWorkspace({ isMobile = false }: RobotWorkspaceProps) {
  const { robotId = 'unknown' } = useParams<{ robotId: string }>();
  const { getLayout, saveLayout, resetLayout, skipNextSaveRef } =
    useRobotLayoutStore();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [panels, setPanels] = useState<LayoutItem[]>(() => [
    ...getLayout(robotId),
  ]);

  const [gridRef, { width: gridWidth, height: gridHeight }] =
    useElementSize<HTMLDivElement>();

  const rowHeight = computeRowHeight(gridHeight);

  const handleLayoutChange = useCallback(
    (layout: readonly LayoutItem[]) => {
      if (skipNextSaveRef.current) {
        skipNextSaveRef.current = false;
        return;
      }
      saveLayout(robotId, layout);
    },
    [robotId, saveLayout, skipNextSaveRef]
  );

  const handleClose = useCallback(
    (panelId: string) => {
      setPanels((prev) => {
        const next = prev.filter((p) => p.i !== panelId);
        saveLayout(robotId, next);
        return next;
      });
    },
    [robotId, saveLayout]
  );

  const handleReset = useCallback(() => {
    resetLayout(robotId);
    setPanels([...DEFAULT_ROBOT_LAYOUT]);
  }, [robotId, resetLayout]);

  const handleAddPanel = useCallback(
    (widgetId: string) => {
      const entry = panelRegistry.find((e) => e.widgetId === widgetId);
      if (!entry) return;
      const newPanel: LayoutItem = {
        i: `${widgetId}-${Date.now()}`,
        x: 0,
        y: Infinity,
        w: entry.defaultSize.w,
        h: entry.defaultSize.h,
      };
      setPanels((prev) => {
        const next = [...prev, newPanel];
        saveLayout(robotId, next);
        return next;
      });
      setPickerOpen(false);
    },
    [robotId, saveLayout]
  );

  if (isMobile) {
    return (
      <div
        data-testid="robot-workspace"
        className="flex flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <p className="text-sm text-slate-300">
          Robot workspace requires desktop viewport
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="robot-workspace"
      className="relative flex h-full flex-col overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-end border-b border-slate-700 bg-slate-900 px-3 py-1">
        <button
          type="button"
          aria-label="Add panel"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1 rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >
          <Plus size={12} />
          Add Panel
        </button>
      </div>

      {/* Grid — ref measured by useElementSize */}
      <div ref={gridRef} className="flex-1 overflow-hidden">
        <ReactGridLayout
          layout={panels}
          cols={12}
          rowHeight={rowHeight}
          width={gridWidth}
          draggableHandle="[data-testid='drag-handle']"
          onLayoutChange={handleLayoutChange}
          margin={[4, 4]}
          containerPadding={[4, 4]}
        >
          {panels.map((item) => {
            const entry = panelRegistry.find(
              (e) =>
                e.widgetId === item.i || item.i.startsWith(`${e.widgetId}-`)
            );
            const WidgetComponent = entry?.component;
            return (
              <div key={item.i} data-testid={`panel-${item.i}`}>
                <PanelFrame
                  panelId={item.i}
                  title={entry?.label ?? item.i}
                  isClosable={!entry?.isSovereign}
                  isSovereign={entry?.isSovereign}
                  onClose={handleClose}
                  onReset={handleReset}
                >
                  {WidgetComponent ? (
                    <WidgetComponent panelId={item.i} robotId={robotId} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-500">
                      Unknown widget: {item.i}
                    </div>
                  )}
                </PanelFrame>
              </div>
            );
          })}
        </ReactGridLayout>
      </div>

      <Show when={pickerOpen}>
        <PanelPicker
          mode="engineer"
          onAddPanel={handleAddPanel}
          onClose={() => setPickerOpen(false)}
        />
      </Show>
    </div>
  );
}
