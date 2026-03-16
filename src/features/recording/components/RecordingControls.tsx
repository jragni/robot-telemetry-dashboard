import { Circle, Square } from 'lucide-react';
import { useState } from 'react';

import { useRecording } from '../hooks/useRecording';

import { useRosStore } from '@/stores/ros.store';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RecordingControlsProps {
  robotId: string | undefined;
}

// ---------------------------------------------------------------------------
// RecordingControls
// ---------------------------------------------------------------------------

/**
 * Start/Stop recording controls with topic selection checkboxes.
 * Designed to be embedded in a sidebar or overlay — not a panel widget.
 */
export function RecordingControls({ robotId }: RecordingControlsProps) {
  const { state, currentSession, startRecording, stopRecording } =
    useRecording(robotId);

  const availableTopics = useRosStore((s) =>
    robotId ? s.getTopics(robotId) : []
  );

  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  const isRecording = state === 'recording';

  function toggleTopic(name: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function handleStartStop() {
    if (isRecording) {
      stopRecording();
    } else {
      const topics =
        selectedTopics.size > 0
          ? [...selectedTopics]
          : availableTopics.map((t) => t.name);
      startRecording(topics);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground'
          }`}
          aria-hidden="true"
        />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {isRecording ? 'Recording' : 'Idle'}
        </span>
        {isRecording && currentSession && (
          <span className="text-xs text-muted-foreground ml-auto">
            {currentSession.messageCount} msg
          </span>
        )}
      </div>

      {/* Topic checkboxes — disabled while recording */}
      {availableTopics.length > 0 && (
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Topics to record
          </p>
          {availableTopics.map((topic) => (
            <label
              key={topic.name}
              className="flex items-center gap-2 text-xs cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selectedTopics.has(topic.name)}
                onChange={() => toggleTopic(topic.name)}
                disabled={isRecording}
                className="accent-primary"
              />
              <span className="truncate font-mono text-foreground">
                {topic.name}
              </span>
            </label>
          ))}
        </div>
      )}

      {availableTopics.length === 0 && !isRecording && (
        <p className="text-xs text-muted-foreground italic">
          No topics available. Connect to a robot first.
        </p>
      )}

      {/* Start / Stop button */}
      <button
        type="button"
        onClick={handleStartStop}
        disabled={!robotId}
        className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }`}
      >
        {isRecording ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop Recording
          </>
        ) : (
          <>
            <Circle className="w-3.5 h-3.5 fill-current text-red-400" />
            Start Recording
          </>
        )}
      </button>
    </div>
  );
}
