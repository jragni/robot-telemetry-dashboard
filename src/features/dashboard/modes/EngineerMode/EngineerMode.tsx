import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import ReactGridLayout, {
  type LayoutItem,
  WidthProvider,
} from 'react-grid-layout/legacy';

import { PanelFrame } from '../../components/PanelFrame/PanelFrame';
import { PanelPicker } from '../../components/PanelPicker/PanelPicker';
import { DEFAULT_LAYOUTS } from '../../registry/defaultLayouts';
import { panelRegistry } from '../../registry/panelRegistry';
import { useLayoutStore } from '../../stores/layoutStore';

import type { EngineerModeProps } from './EngineerMode.types';

import { Show } from '@/shared/components/Show';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGrid = WidthProvider(ReactGridLayout);

const HEADER_HEIGHT = 56;
const BOTTOM_PADDING = 16;
const GRID_ROWS = 10;

function computeRowHeight(): number {
  return Math.floor(
    (window.innerHeight - HEADER_HEIGHT - BOTTOM_PADDING) / GRID_ROWS
  );
}

export function EngineerMode({ isMobile = false }: EngineerModeProps) {
  const { getLayout, saveLayout, resetLayout, skipNextSaveRef } =
    useLayoutStore();

  const [rowHeight, setRowHeight] = useState(computeRowHeight);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [panels, setPanels] = useState<LayoutItem[]>(() => [
    ...getLayout('engineer'),
  ]);

  // Update rowHeight on window resize (debounced 150ms) — ISS-008 prevention
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setRowHeight(computeRowHeight());
      }, 150);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Sync panels from store when store changes
  useEffect(() => {
    setPanels([...getLayout('engineer')]);
  }, [getLayout]);

  const handleLayoutChange = useCallback(
    (layout: readonly LayoutItem[]) => {
      if (skipNextSaveRef.current) {
        skipNextSaveRef.current = false;
        return;
      }
      saveLayout('engineer', layout);
    },
    [saveLayout, skipNextSaveRef]
  );

  const handleClose = useCallback(
    (panelId: string) => {
      setPanels((prev) => {
        const next = prev.filter((p) => p.i !== panelId);
        saveLayout('engineer', next);
        return next;
      });
    },
    [saveLayout]
  );

  const handleReset = useCallback(() => {
    resetLayout('engineer');
    setPanels([...DEFAULT_LAYOUTS.engineer]);
  }, [resetLayout]);

  const handleAddPanel = useCallback(
    (widgetId: string) => {
      const entry = panelRegistry.find((e) => e.widgetId === widgetId);
      if (!entry) return;
      const newPanel: LayoutItem = {
        i: `${widgetId}-${Date.now()}`,
        x: 0,
        y: Infinity, // react-grid-layout places at bottom
        w: entry.defaultSize.w,
        h: entry.defaultSize.h,
      };
      setPanels((prev) => {
        const next = [...prev, newPanel];
        saveLayout('engineer', next);
        return next;
      });
      setPickerOpen(false);
    },
    [saveLayout]
  );

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-slate-300">
          Engineer mode requires desktop viewport
        </p>
        <a
          href="/pilot"
          className="text-xs text-blue-400 underline hover:text-blue-300"
        >
          Switch to Pilot
        </a>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col overflow-hidden">
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

      {/* Grid */}
      <ResponsiveGrid
        layout={panels}
        cols={12}
        rowHeight={rowHeight}
        draggableHandle="[data-testid='drag-handle']"
        onLayoutChange={handleLayoutChange}
        margin={[4, 4]}
        containerPadding={[4, 4]}
      >
        {panels.map((item) => {
          const entry = panelRegistry.find(
            (e) => e.widgetId === item.i || item.i.startsWith(`${e.widgetId}-`)
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
                  <WidgetComponent panelId={item.i} />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">
                    Unknown widget: {item.i}
                  </div>
                )}
              </PanelFrame>
            </div>
          );
        })}
      </ResponsiveGrid>

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
