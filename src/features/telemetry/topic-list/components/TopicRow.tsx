import type { TopicSubscriptionState } from '../topic-list.types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TopicRowProps {
  topic: TopicSubscriptionState;
  onToggle: (topicName: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a single row in the topic list showing the topic name, message
 * type, a subscribe/unsubscribe toggle button, and — when subscribed — a
 * live JSON preview of the last received message.
 */
export function TopicRow({ topic, onToggle }: TopicRowProps) {
  const { topicName, messageType, isSubscribed, lastMessage, lastMessageAt } =
    topic;

  return (
    <div
      data-testid="topic-row"
      className="border-b border-border/50 px-3 py-2 last:border-b-0"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs font-semibold text-foreground">
            {topicName}
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {messageType}
          </p>
          {lastMessageAt !== null && (
            <p className="text-xs text-muted-foreground/60">
              {new Date(lastMessageAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggle(topicName)}
          aria-pressed={isSubscribed}
          aria-label={
            isSubscribed
              ? `Unsubscribe from ${topicName}`
              : `Subscribe to ${topicName}`
          }
          className={[
            'shrink-0 rounded px-2 py-1 text-xs font-semibold transition-colors',
            isSubscribed
              ? 'bg-primary text-primary-foreground hover:bg-primary/80'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          ].join(' ')}
        >
          {isSubscribed ? 'Unsub' : 'Sub'}
        </button>
      </div>

      {isSubscribed && lastMessage !== null && (
        <pre
          data-testid="topic-row-preview"
          className="mt-1 max-h-32 overflow-auto rounded bg-muted/50 p-1 font-mono text-xs"
        >
          {JSON.stringify(lastMessage, null, 2)}
        </pre>
      )}
    </div>
  );
}
