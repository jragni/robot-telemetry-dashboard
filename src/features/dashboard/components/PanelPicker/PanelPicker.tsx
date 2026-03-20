import { X } from 'lucide-react';
import { useState } from 'react';

import { panelRegistry } from '../../registry/panelRegistry';

import type { PanelPickerProps } from './PanelPicker.types';

export function PanelPicker({ mode, onAddPanel, onClose }: PanelPickerProps) {
  const [search, setSearch] = useState('');

  const available = panelRegistry.filter((entry) =>
    entry.availableInModes.includes(mode)
  );

  const filtered = available.filter(
    (entry) =>
      entry.label.toLowerCase().includes(search.toLowerCase()) ||
      entry.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add Panel"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="relative w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-xl">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Add Panel</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <input
          type="search"
          role="searchbox"
          placeholder="Search panels…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500"
        />

        {/* Widget grid */}
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            No panels found
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {filtered.map((entry) => (
              <button
                key={entry.widgetId}
                type="button"
                onClick={() => onAddPanel(entry.widgetId)}
                className="flex flex-col items-start rounded border border-slate-700 bg-slate-800 p-3 text-left hover:border-blue-500 hover:bg-slate-700"
              >
                <span className="text-xs font-semibold text-slate-200">
                  {entry.label}
                </span>
                <span className="mt-1 text-xs text-slate-400">
                  {entry.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
