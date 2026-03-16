import { useState, useEffect, useRef, useCallback } from 'react';
import type { Subscription } from 'rxjs';

import type { TopicSubscriptionState } from '../topic-list.types';

import { useRosConnection } from '@/features/telemetry/shared';
import { getTopics$ } from '@/services/ros/discovery/TopicDiscovery';
import { createTopicSubscription } from '@/services/ros/subscriber/TopicSubscriber';
import type { TopicInfo } from '@/types';

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseTopicListResult {
  topics: TopicSubscriptionState[];
  connectionState: ReturnType<typeof useRosConnection>['connectionState'];
  filter: string;
  setFilter: (value: string) => void;
  refresh: () => void;
  toggleSubscription: (topicName: string) => void;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTopicList(robotId: string | undefined): UseTopicListResult {
  const { ros, connectionState } = useRosConnection(robotId);

  const [rawTopics, setRawTopics] = useState<TopicInfo[]>([]);
  const [subscriptionStates, setSubscriptionStates] = useState<
    Map<string, TopicSubscriptionState>
  >(new Map());
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Map of active RxJS subscriptions keyed by topic name
  const activeSubscriptions = useRef<Map<string, Subscription>>(new Map());

  // ---------------------------------------------------------------------------
  // Fetch topic list
  // ---------------------------------------------------------------------------

  const fetchTopics = useCallback(() => {
    if (!ros) return;

    setIsLoading(true);

    const sub = getTopics$(ros).subscribe({
      next: (topics) => {
        setRawTopics(topics);
        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
      },
    });

    return () => sub.unsubscribe();
  }, [ros]);

  // Fetch on connect
  useEffect(() => {
    if (connectionState !== 'connected' || !ros) {
      setRawTopics([]);
      setSubscriptionStates(new Map());
      // Unsubscribe all active topic subscriptions when disconnected
      activeSubscriptions.current.forEach((s) => s.unsubscribe());
      activeSubscriptions.current.clear();
      return;
    }

    return fetchTopics();
  }, [connectionState, ros, fetchTopics]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      activeSubscriptions.current.forEach((s) => s.unsubscribe());
      activeSubscriptions.current.clear();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Toggle subscription
  // ---------------------------------------------------------------------------

  const toggleSubscription = useCallback(
    (topicName: string) => {
      if (!ros) return;

      const existing = activeSubscriptions.current.get(topicName);
      if (existing) {
        // Unsubscribe
        existing.unsubscribe();
        activeSubscriptions.current.delete(topicName);
        setSubscriptionStates((prev) => {
          const next = new Map(prev);
          const entry = next.get(topicName);
          if (entry) {
            next.set(topicName, { ...entry, isSubscribed: false });
          }
          return next;
        });
      } else {
        // Find message type from rawTopics
        const topicInfo = rawTopics.find((t) => t.name === topicName);
        const messageType = topicInfo?.messageType ?? '';

        const observable$ = createTopicSubscription<unknown>(
          ros,
          topicName,
          messageType
        );

        // Initialise state entry
        setSubscriptionStates((prev) => {
          const next = new Map(prev);
          next.set(topicName, {
            topicName,
            messageType,
            isSubscribed: true,
            lastMessage: null,
            lastMessageAt: null,
          });
          return next;
        });

        const sub = observable$.subscribe((msg) => {
          setSubscriptionStates((prev) => {
            const next = new Map(prev);
            next.set(topicName, {
              topicName,
              messageType,
              isSubscribed: true,
              lastMessage: msg,
              lastMessageAt: Date.now(),
            });
            return next;
          });
        });

        activeSubscriptions.current.set(topicName, sub);
      }
    },
    [ros, rawTopics]
  );

  // ---------------------------------------------------------------------------
  // Derived: merged topic list
  // ---------------------------------------------------------------------------

  const topics: TopicSubscriptionState[] = rawTopics.map((t) => {
    const state = subscriptionStates.get(t.name);
    return (
      state ?? {
        topicName: t.name,
        messageType: t.messageType,
        isSubscribed: false,
        lastMessage: null,
        lastMessageAt: null,
      }
    );
  });

  const filteredTopics = filter
    ? topics.filter(
        (t) =>
          t.topicName.toLowerCase().includes(filter.toLowerCase()) ||
          t.messageType.toLowerCase().includes(filter.toLowerCase())
      )
    : topics;

  return {
    topics: filteredTopics,
    connectionState,
    filter,
    setFilter,
    refresh: fetchTopics,
    toggleSubscription,
    isLoading,
  };
}
