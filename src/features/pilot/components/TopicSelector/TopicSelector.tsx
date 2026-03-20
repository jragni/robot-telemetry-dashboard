import { useEffect } from 'react';
import { useStore } from 'zustand';

import type { TopicSelectorProps } from './TopicSelector.types';

import { Show } from '@/shared/components/Show';

const TWIST_TYPE = 'geometry_msgs/Twist';

export function TopicSelector({
  controlStore,
  availableTopics,
}: TopicSelectorProps) {
  const eStopActive = useStore(controlStore, (s) => s.eStopActive);
  const selectedTopic = useStore(controlStore, (s) => s.selectedTopic);

  const twistTopics = availableTopics.filter((t) => t.type === TWIST_TYPE);
  const noTopics = twistTopics.length === 0;

  // Sync default selection when topic list changes
  useEffect(() => {
    if (noTopics) return;
    const hasCmdVel = twistTopics.some((t) => t.name === '/cmd_vel');
    if (hasCmdVel) {
      controlStore.getState().setTopic('/cmd_vel');
    } else {
      controlStore.getState().setTopic(twistTopics[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTopics]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="topic-selector" className="text-xs text-slate-400">
        Topic
      </label>
      <Show
        when={!noTopics}
        fallback={
          <select
            id="topic-selector"
            role="combobox"
            disabled
            className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-500"
          >
            <option>No cmd_vel topics available</option>
          </select>
        }
      >
        <select
          id="topic-selector"
          role="combobox"
          disabled={eStopActive}
          value={selectedTopic}
          onChange={(e) => controlStore.getState().setTopic(e.target.value)}
          className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200 disabled:opacity-50"
        >
          {twistTopics.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </Show>
    </div>
  );
}
