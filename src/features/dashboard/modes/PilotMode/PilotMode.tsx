import { Plus } from 'lucide-react';
import { useState, useCallback } from 'react';
import ReactGridLayout, {
  type LayoutItem,
  WidthProvider,
} from 'react-grid-layout/legacy';

import { PanelFrame } from '../../components/PanelFrame/PanelFrame';
import { PanelPicker } from '../../components/PanelPicker/PanelPicker';
import { DEFAULT_LAYOUTS } from '../../registry/defaultLayouts';
import { panelRegistry } from '../../registry/panelRegistry';
import { useLayoutStore } from '../../stores/layoutStore';

import type { PilotModeProps } from './PilotMode.types';

import { Show } from '@/shared/components/Show';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGrid = WidthProvider(ReactGridLayout);

// Fixed panels in Pilot mode — not closable
const FIXED_PANELS = new Set(['video', 'controls']);
// Sovereign panel
const SOVEREIGN_PANELS = new Set(['video']);
// Bottom row eligible panels (resizable/reorderable)
const BOTTOM_ROW_PANELS = new Set([
  'imu',
  'data-plot',
  'topic-list',
  'depth-camera',
]);

function isPanelClosable(panelId: string): boolean {
  const baseId = panelId.replace(/-\d+$/, '');
  return !FIXED_PANELS.has(panelId) && !FIXED_PANELS.has(baseId);
}

function isPanelSovereign(panelId: string): boolean {
  return SOVEREIGN_PANELS.has(panelId);
}

function isBottomRow(panelId: string): boolean {
  return BOTTOM_ROW_PANELS.has(panelId);
}

function PilotMobileLayout({ robotId: _robotId }: { robotId: string }) {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Video */}
      <div
        data-testid="pilot-mobile-video"
        className="relative shrink-0 bg-black"
        style={{ aspectRatio: '16/9' }}
      >
        <div className="flex h-full items-center justify-center text-xs text-slate-400">
          Video Feed — Phase 8
        </div>
      </div>

      {/* Instrument strip */}
      <div
        data-testid="pilot-instrument-strip"
        className="flex shrink-0 items-center justify-around border-b border-slate-700 bg-slate-900 py-2 text-xs"
      >
        <div>
          <span className="text-slate-400">Heading</span>{' '}
          <span className="font-mono text-blue-300">—</span>
        </div>
        <div>
          <span className="text-slate-400">Vel</span>{' '}
          <span className="font-mono text-blue-300">—</span>
        </div>
        <div>
          <span className="text-slate-400">Batt</span>{' '}
          <span className="font-mono text-blue-300">—</span>
        </div>
      </div>

      {/* Virtual D-pad */}
      <div
        data-testid="pilot-dpad"
        className="flex shrink-0 flex-col items-center gap-1 py-3"
      >
        <button
          type="button"
          aria-label="Forward"
          data-testid="dpad-btn-forward"
          data-min-size="48"
          className="flex h-12 w-12 items-center justify-center rounded bg-slate-700 text-slate-200"
        >
          ↑
        </button>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Left"
            data-testid="dpad-btn-left"
            data-min-size="48"
            className="flex h-12 w-12 items-center justify-center rounded bg-slate-700 text-slate-200"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Stop"
            data-testid="dpad-btn-stop"
            data-min-size="48"
            className="flex h-12 w-12 items-center justify-center rounded bg-red-700 text-white font-bold"
          >
            ■
          </button>
          <button
            type="button"
            aria-label="Right"
            data-testid="dpad-btn-right"
            data-min-size="48"
            className="flex h-12 w-12 items-center justify-center rounded bg-slate-700 text-slate-200"
          >
            →
          </button>
        </div>
        <button
          type="button"
          aria-label="Back"
          data-testid="dpad-btn-back"
          data-min-size="48"
          className="flex h-12 w-12 items-center justify-center rounded bg-slate-700 text-slate-200"
        >
          ↓
        </button>
      </div>

      {/* Swipeable telemetry cards */}
      <div
        data-testid="pilot-swipeable-cards"
        className="flex-1 overflow-x-auto"
      >
        <div className="flex h-full gap-2 px-2">
          <div className="h-full w-64 shrink-0 rounded border border-slate-700 bg-slate-900 p-2 text-xs text-slate-400">
            IMU
          </div>
          <div className="h-full w-64 shrink-0 rounded border border-slate-700 bg-slate-900 p-2 text-xs text-slate-400">
            Data Plot
          </div>
        </div>
      </div>
    </div>
  );
}

export function PilotMode({ robotId = '', isMobile = false }: PilotModeProps) {
  const { getLayout, saveLayout, resetLayout, skipNextSaveRef } =
    useLayoutStore();
  const [panels, setPanels] = useState<LayoutItem[]>(() => [
    ...getLayout('pilot'),
  ]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleLayoutChange = useCallback(
    (layout: readonly LayoutItem[]) => {
      if (skipNextSaveRef.current) {
        skipNextSaveRef.current = false;
        return;
      }
      saveLayout('pilot', layout);
    },
    [saveLayout, skipNextSaveRef]
  );

  const handleClose = useCallback(
    (panelId: string) => {
      setPanels((prev) => {
        const next = prev.filter((p) => p.i !== panelId);
        saveLayout('pilot', next);
        return next;
      });
    },
    [saveLayout]
  );

  const handleReset = useCallback(() => {
    resetLayout('pilot');
    setPanels([...DEFAULT_LAYOUTS.pilot]);
  }, [resetLayout]);

  const handleAddPanel = useCallback(
    (widgetId: string) => {
      const entry = panelRegistry.find((e) => e.widgetId === widgetId);
      if (!entry) return;
      const bottomPanels = panels.filter((p) => isBottomRow(p.i));
      const lastY = bottomPanels.reduce((max, p) => Math.max(max, p.y), 0);
      const newPanel: LayoutItem = {
        i: `${widgetId}-${Date.now()}`,
        x: 0,
        y: lastY + 1,
        w: entry.defaultSize.w,
        h: entry.defaultSize.h,
      };
      setPanels((prev) => {
        const next = [...prev, newPanel];
        saveLayout('pilot', next);
        return next;
      });
      setPickerOpen(false);
    },
    [panels, saveLayout]
  );

  if (isMobile) {
    return <PilotMobileLayout robotId={robotId} />;
  }

  return (
    <div className="relative flex flex-col">
      {/* Grid */}
      <ResponsiveGrid
        layout={panels}
        cols={12}
        rowHeight={80}
        draggableHandle="[data-testid='drag-handle']"
        onLayoutChange={handleLayoutChange}
        margin={[4, 4]}
        containerPadding={[4, 4]}
      >
        {panels.map((item) => {
          const baseId = item.i.replace(/-\d+$/, '');
          const entry = panelRegistry.find(
            (e) => e.widgetId === baseId || e.widgetId === item.i
          );
          const WidgetComponent = entry?.component ?? null;
          const closable = isPanelClosable(item.i);
          const sovereign = isPanelSovereign(item.i);
          const bottomPanel = isBottomRow(item.i) || isBottomRow(baseId);

          return (
            <div key={item.i} data-testid={`panel-${item.i}`}>
              <PanelFrame
                panelId={item.i}
                title={entry?.label ?? item.i}
                isClosable={closable}
                isSovereign={sovereign}
                showDragHandle={bottomPanel}
                onClose={handleClose}
                onReset={handleReset}
              >
                {WidgetComponent ? (
                  <WidgetComponent panelId={item.i} robotId={robotId} />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">
                    {item.i}
                  </div>
                )}
              </PanelFrame>
            </div>
          );
        })}
      </ResponsiveGrid>

      {/* Add panel button for bottom row */}
      <div className="flex justify-end border-t border-slate-700 px-3 py-1">
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

      <Show when={pickerOpen}>
        <PanelPicker
          mode="pilot"
          onAddPanel={handleAddPanel}
          onClose={() => setPickerOpen(false)}
        />
      </Show>
    </div>
  );
}
