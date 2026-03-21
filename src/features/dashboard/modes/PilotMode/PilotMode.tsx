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

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ControlWidget } from '@/features/pilot/components/ControlWidget/ControlWidget';
import { Show } from '@/shared/components/Show';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGrid = WidthProvider(ReactGridLayout);

// Fixed panels in Pilot mode — not closable
const FIXED_PANELS = new Set(['video', 'robot-controls']);
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

const MOBILE_CARDS = [
  { id: 'video-instruments', label: 'Video + Instruments' },
  { id: 'controls', label: 'Controls' },
  { id: 'imu', label: 'IMU' },
  { id: 'data-plot', label: 'Data Plot' },
] as const;

function CarouselDots({
  api,
  count,
}: {
  api: CarouselApi | undefined;
  count: number;
}) {
  const [selected, setSelected] = useState(0);

  // Subscribe to embla select events
  useState(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on('select', onSelect);
    onSelect();
  });

  return (
    <div
      data-testid="pilot-mobile-carousel-dots"
      className="flex shrink-0 items-center justify-center gap-2 py-2"
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to slide ${String(i + 1)}`}
          data-testid={`pilot-mobile-dot-${String(i)}`}
          onClick={() => api?.scrollTo(i)}
          className={[
            'h-2 w-2 rounded-full transition-colors',
            i === selected
              ? 'bg-primary'
              : 'bg-muted-foreground/40 hover:bg-muted-foreground/70',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

function PilotMobileLayout({ robotId }: { robotId: string }) {
  const [api, setApi] = useState<CarouselApi>();

  return (
    // Fix 4: flex-col with flex-1 fills all available height between header and bottom bar
    <div className="flex h-full flex-col overflow-hidden">
      {/* Video strip — shrink-0 */}
      <div
        data-testid="pilot-mobile-video"
        className="relative shrink-0 bg-black"
        style={{ aspectRatio: '16/9' }}
      >
        <div className="flex h-full items-center justify-center text-xs text-slate-400">
          Video Feed — Phase 8
        </div>
      </div>

      {/* Instrument strip — shrink-0 */}
      <div
        data-testid="pilot-instrument-strip"
        className="flex shrink-0 items-center justify-around border-b border-border bg-card py-2 text-xs"
      >
        <div>
          <span className="text-muted-foreground">Heading</span>{' '}
          <span className="font-mono text-primary">—</span>
        </div>
        <div>
          <span className="text-muted-foreground">Vel</span>{' '}
          <span className="font-mono text-primary">—</span>
        </div>
        <div>
          <span className="text-muted-foreground">Batt</span>{' '}
          <span className="font-mono text-primary">—</span>
        </div>
      </div>

      {/* Fix 1: Swipeable carousel — flex-1 min-h-0 fills available height */}
      <Carousel
        data-testid="pilot-mobile-carousel"
        opts={{ align: 'start', loop: false }}
        setApi={setApi}
        className="flex flex-1 min-h-0 flex-col"
      >
        <CarouselContent className="flex-1 min-h-0 h-full">
          {/* Card 0: Video + Instruments (placeholder — video already above, this holds instrument details) */}
          <CarouselItem
            data-testid="pilot-mobile-card-0"
            className="h-full basis-full pl-0"
          >
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {MOBILE_CARDS[0].label}
            </div>
          </CarouselItem>

          {/* Card 1: Controls */}
          <CarouselItem
            data-testid="pilot-mobile-card-1"
            className="h-full basis-full pl-0"
          >
            {/* pilot-dpad testid kept for existing test compatibility */}
            <div data-testid="pilot-dpad" className="h-full">
              <ControlWidget
                robotId={robotId}
                panelId="robot-controls"
                isMobile={true}
              />
            </div>
          </CarouselItem>

          {/* Card 2: IMU */}
          <CarouselItem
            data-testid="pilot-mobile-card-2"
            className="h-full basis-full pl-0"
          >
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {MOBILE_CARDS[2].label}
            </div>
          </CarouselItem>

          {/* Card 3: Data Plot */}
          <CarouselItem
            data-testid="pilot-mobile-card-3"
            className="h-full basis-full pl-0"
          >
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {MOBILE_CARDS[3].label}
            </div>
          </CarouselItem>
        </CarouselContent>

        {/* Dot indicators */}
        <CarouselDots api={api} count={MOBILE_CARDS.length} />
      </Carousel>
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
    <div data-testid="pilot-mode" className="relative flex flex-col">
      {/* Grid */}
      <ResponsiveGrid
        layout={panels}
        cols={12}
        rowHeight={60}
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
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    {item.i}
                  </div>
                )}
              </PanelFrame>
            </div>
          );
        })}
      </ResponsiveGrid>

      {/* Add panel button for bottom row */}
      <div className="flex justify-end border-t border-border px-3 py-1">
        <button
          type="button"
          aria-label="Add panel"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"
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
