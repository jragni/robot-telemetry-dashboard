import { X } from 'lucide-react';
import { useState } from 'react';

import type { TabGroupProps } from './TabGroup.types';

import { Show } from '@/shared/components/Show';

export function TabGroup({ panelId, tabs, onRemoveTab }: TabGroupProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Clamp active index when tabs change
  const safeIndex = Math.min(activeTabIndex, Math.max(0, tabs.length - 1));
  const activeTab = tabs[safeIndex];

  const tablistId = `tablist-${panelId}`;

  return (
    <div data-testid={panelId} className="flex h-full flex-col overflow-hidden">
      {/* Tab bar */}
      <div
        role="tablist"
        id={tablistId}
        aria-label={`Tab group ${panelId}`}
        className="flex shrink-0 items-center border-b border-slate-700 bg-slate-800"
      >
        {tabs.map((tab, index) => {
          const isActive = index === safeIndex;
          const tabId = `tab-${panelId}-${tab.widgetId}`;
          const panelId_ = `tabpanel-${panelId}-${tab.widgetId}`;
          return (
            <div key={tab.widgetId} className="flex items-center">
              <button
                role="tab"
                id={tabId}
                aria-selected={isActive}
                aria-controls={panelId_}
                type="button"
                onClick={() => setActiveTabIndex(index)}
                className={[
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'border-b-2 border-blue-500 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200',
                ].join(' ')}
              >
                {tab.label}
              </button>
              <button
                type="button"
                aria-label="Close tab"
                onClick={() => onRemoveTab(panelId, tab.widgetId)}
                className="mr-1 rounded p-0.5 text-slate-500 hover:bg-slate-700 hover:text-slate-200"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Tab content */}
      <Show when={!!activeTab}>
        <div
          role="tabpanel"
          id={`tabpanel-${panelId}-${activeTab?.widgetId}`}
          aria-labelledby={`tab-${panelId}-${activeTab?.widgetId}`}
          className="flex-1 overflow-hidden"
        >
          {activeTab?.content}
        </div>
      </Show>
    </div>
  );
}
