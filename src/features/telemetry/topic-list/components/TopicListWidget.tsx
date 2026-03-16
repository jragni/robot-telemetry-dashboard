import { RefreshCw, Search } from 'lucide-react';

import { useTopicList } from '../hooks/useTopicList';

import { TopicRow } from './TopicRow';

import type { PanelComponentProps } from '@/features/panels/panel.types';
import { NoConnectionOverlay } from '@/features/telemetry/shared/NoConnectionOverlay';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Panel widget that lists all advertised ROS topics, allows text filtering,
 * on-demand refresh, and per-topic subscribe/unsubscribe with live JSON
 * message preview.
 */
export function TopicListWidget({ robotId, panelId }: PanelComponentProps) {
  const {
    topics,
    connectionState,
    filter,
    setFilter,
    refresh,
    toggleSubscription,
    isLoading,
  } = useTopicList(robotId);

  return (
    <div
      data-panel-id={panelId}
      className="relative flex h-full w-full flex-col overflow-hidden"
    >
      <NoConnectionOverlay connectionState={connectionState} />

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border/50 p-2">
        <div className="relative flex-1">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Filter topics"
            placeholder="Filter topics…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded border border-border/50 bg-muted/30 py-1 pl-6 pr-2 font-mono text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="button"
          aria-label="Refresh topics"
          onClick={refresh}
          disabled={isLoading || connectionState !== 'connected'}
          className="flex shrink-0 items-center gap-1 rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <RefreshCw
            size={12}
            className={isLoading ? 'animate-spin' : ''}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {/* Topic count summary */}
      <div className="shrink-0 px-3 py-1">
        <span className="font-mono text-xs text-muted-foreground">
          {topics.length} topic{topics.length !== 1 ? 's' : ''}
          {filter && ' (filtered)'}
        </span>
      </div>

      {/* Scrollable list */}
      <div
        role="list"
        aria-label="ROS topics"
        className="flex-1 overflow-y-auto"
      >
        {topics.length === 0 &&
          connectionState === 'connected' &&
          !isLoading && (
            <p className="p-4 text-center font-mono text-xs text-muted-foreground">
              {filter ? 'No topics match the filter.' : 'No topics discovered.'}
            </p>
          )}

        {topics.map((topic) => (
          <TopicRow
            key={topic.topicName}
            topic={topic}
            onToggle={toggleSubscription}
          />
        ))}
      </div>
    </div>
  );
}
