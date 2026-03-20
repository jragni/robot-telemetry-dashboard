import { Plus } from 'lucide-react';
import { useState, useCallback } from 'react';
import ReactGridLayout, {
  type LayoutItem,
  WidthProvider,
} from 'react-grid-layout/legacy';

import { PanelFrame } from '../../components/PanelFrame/PanelFrame';
import { DEFAULT_LAYOUTS } from '../../registry/defaultLayouts';
import { panelRegistry } from '../../registry/panelRegistry';
import { useLayoutStore } from '../../stores/layoutStore';

import type { DashboardModeProps, PanelConfig } from './DashboardMode.types';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGrid = WidthProvider(ReactGridLayout);

// Panels that are not closable in Dashboard mode (sovereign or structural)
const FIXED_PANELS = new Set(['map', 'fleet-status']);
// Panels that are sovereign (cannot be tabbed or moved, must always be present)
const SOVEREIGN_PANELS = new Set(['map']);

function getPanelConfig(layoutId: string): PanelConfig {
  // Handle composite keys like 'video-pip-1', 'video-pip-2'
  const baseId = layoutId.replace(/-\d+$/, '').replace('-pip', '');
  const registryId = layoutId.startsWith('video-pip') ? 'video' : baseId;
  const entry = panelRegistry.find((e) => e.widgetId === registryId);

  return {
    i: layoutId,
    label: entry?.label ?? layoutId,
    isClosable: !FIXED_PANELS.has(layoutId) && !FIXED_PANELS.has(registryId),
    isSovereign: SOVEREIGN_PANELS.has(layoutId),
    WidgetComponent: entry?.component ?? null,
  };
}

export function DashboardMode({ isMobile = false }: DashboardModeProps) {
  const { getLayout, saveLayout, resetLayout, skipNextSaveRef } =
    useLayoutStore();
  const [panels, setPanels] = useState<LayoutItem[]>(() => [
    ...getLayout('dashboard'),
  ]);

  const handleLayoutChange = useCallback(
    (layout: readonly LayoutItem[]) => {
      if (skipNextSaveRef.current) {
        skipNextSaveRef.current = false;
        return;
      }
      saveLayout('dashboard', layout);
    },
    [saveLayout, skipNextSaveRef]
  );

  const handleClose = useCallback(
    (panelId: string) => {
      setPanels((prev) => {
        const next = prev.filter((p) => p.i !== panelId);
        saveLayout('dashboard', next);
        return next;
      });
    },
    [saveLayout]
  );

  const handleReset = useCallback(() => {
    resetLayout('dashboard');
    setPanels([...DEFAULT_LAYOUTS.dashboard]);
  }, [resetLayout]);

  const handleAddVideo = useCallback(() => {
    const existingPips = panels.filter((p) =>
      p.i.startsWith('video-pip')
    ).length;
    if (existingPips >= 4) return;
    const newPanel: LayoutItem = {
      i: `video-pip-${existingPips + 1}`,
      x: 0,
      y: Infinity,
      w: 3,
      h: 4,
    };
    setPanels((prev) => {
      const next = [...prev, newPanel];
      saveLayout('dashboard', next);
      return next;
    });
  }, [panels, saveLayout]);

  if (isMobile) {
    return (
      <div
        data-testid="dashboard-mobile-layout"
        className="flex flex-col gap-2 p-2"
      >
        {panels.map((item) => {
          const { label, WidgetComponent } = getPanelConfig(item.i);
          return (
            <div
              key={item.i}
              data-testid={`panel-${item.i}`}
              className="rounded border border-slate-700"
            >
              <div className="border-b border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                {label}
              </div>
              <div className="h-32 overflow-hidden">
                {WidgetComponent ? (
                  <WidgetComponent panelId={item.i} />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">
                    {item.i}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-end border-b border-slate-700 bg-slate-900 px-3 py-1">
        <button
          type="button"
          aria-label="Add video PIP"
          onClick={handleAddVideo}
          className="flex items-center gap-1 rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >
          <Plus size={12} />
          Add Video
        </button>
      </div>

      {/* Grid — no dragging in Dashboard mode (isDraggable=false) */}
      <ResponsiveGrid
        layout={panels}
        cols={12}
        rowHeight={80}
        isDraggable={false}
        isResizable={true}
        onLayoutChange={handleLayoutChange}
        margin={[4, 4]}
        containerPadding={[4, 4]}
      >
        {panels.map((item) => {
          const { label, isClosable, isSovereign, WidgetComponent } =
            getPanelConfig(item.i);
          return (
            <div key={item.i} data-testid={`panel-${item.i}`}>
              <PanelFrame
                panelId={item.i}
                title={label}
                isClosable={isClosable}
                isSovereign={isSovereign}
                showDragHandle={false}
                onClose={handleClose}
                onReset={handleReset}
              >
                {WidgetComponent ? (
                  <WidgetComponent panelId={item.i} />
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
    </div>
  );
}
