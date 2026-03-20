import { useState } from 'react';

import { useRosConnection } from '../../hooks/useRosConnection';
import { useTopicList } from '../../hooks/useTopicList';
import { NoConnectionOverlay } from '../NoConnectionOverlay/NoConnectionOverlay';

import type { TopicListWidgetProps } from './TopicListWidget.types';

import { Show } from '@/shared/components/Show';

export function TopicListWidget({ robotId }: TopicListWidgetProps) {
  const [filter, setFilter] = useState('');
  const [subscribedTopic, setSubscribedTopic] = useState<string | null>(null);
  const [previewData] = useState<unknown>(null);

  const { isConnected, connectionState } = useRosConnection(robotId);
  const { topics, isLoading, error } = useTopicList(robotId);

  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.type.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSubscribe = (topicName: string) => {
    setSubscribedTopic(topicName);
  };

  const handleUnsubscribe = () => {
    setSubscribedTopic(null);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded bg-slate-900 text-slate-200">
      <Show when={!isConnected}>
        <NoConnectionOverlay
          robotId={robotId}
          connectionState={connectionState}
        />
      </Show>

      {/* Search / filter */}
      <div className="shrink-0 border-b border-slate-700 px-3 py-2">
        <label htmlFor="topic-filter" className="sr-only">
          Filter topics
        </label>
        <input
          id="topic-filter"
          type="text"
          aria-label="Filter topics"
          placeholder="Search topics…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {/* Topic list */}
      <div className="flex-1 overflow-auto">
        <Show when={isLoading}>
          <div className="px-3 py-4 text-xs text-slate-400">
            Fetching topics…
          </div>
        </Show>

        <Show when={!isLoading && !!error}>
          <div className="px-3 py-4 text-xs text-red-400">{error}</div>
        </Show>

        <Show
          when={
            !isLoading &&
            !error &&
            filteredTopics.length === 0 &&
            filter.length > 0
          }
        >
          <div className="px-3 py-4 text-xs text-slate-400">
            No topics match &quot;{filter}&quot;
          </div>
        </Show>

        <Show when={!isLoading && !error}>
          <ul className="divide-y divide-slate-700/50">
            {filteredTopics.map((topic) => {
              const isSubscribed = subscribedTopic === topic.name;
              return (
                <li key={topic.name} className="px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-xs text-blue-300">
                        {topic.name}
                      </div>
                      <div className="truncate text-xs text-slate-400">
                        {topic.type}
                      </div>
                    </div>
                    <Show
                      when={isSubscribed}
                      fallback={
                        <button
                          onClick={() => handleSubscribe(topic.name)}
                          aria-label={`Subscribe to ${topic.name}`}
                          className="shrink-0 rounded border border-slate-600 px-2 py-0.5 text-xs hover:bg-slate-700"
                        >
                          Subscribe
                        </button>
                      }
                    >
                      <button
                        onClick={handleUnsubscribe}
                        aria-label={`Unsubscribe from ${topic.name}`}
                        className="shrink-0 rounded border border-red-700 px-2 py-0.5 text-xs text-red-400 hover:bg-red-900/30"
                      >
                        Unsubscribe
                      </button>
                    </Show>
                  </div>
                </li>
              );
            })}
          </ul>
        </Show>
      </div>

      {/* JSON Preview Panel */}
      <Show when={!!subscribedTopic}>
        <div
          data-testid="json-preview-panel"
          className="shrink-0 border-t border-slate-700 bg-slate-800 p-3"
        >
          <div className="mb-1 text-xs text-slate-400">{subscribedTopic}</div>
          <pre className="max-h-32 overflow-auto text-xs text-slate-300">
            {previewData
              ? JSON.stringify(previewData, null, 2)
              : 'Waiting for message…'}
          </pre>
        </div>
      </Show>
    </div>
  );
}
