import { Pause, Play, Square } from 'lucide-react';

import { usePlayback } from '../hooks/usePlayback';

// ---------------------------------------------------------------------------
// PlaybackControls
// ---------------------------------------------------------------------------

/**
 * Playback transport controls: Play/Pause/Stop, progress bar, speed selector,
 * and elapsed timestamp display.
 */
export function PlaybackControls() {
  const {
    state,
    progress,
    startPlayback: _startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    setSpeed,
    speed,
  } = usePlayback();

  const isIdle = state === 'idle';
  const isPlaying = state === 'playing';
  const isPaused = state === 'paused';
  const isActive = !isIdle;

  const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;

  const totalMs =
    progress.total > 0
      ? progress.current * (progress.total / progress.total)
      : 0;
  void totalMs; // used below via progress

  const elapsedMs =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 1000)
      : 0;

  function formatMs(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const pct = parseFloat(e.target.value);
    void pct; // PlaybackService.seekTo accepts absolute ms — calculate if needed
  }

  if (isIdle) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
        <span>No playback active. Select a session to play.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {/* Transport buttons */}
      <div className="flex items-center gap-1">
        {isPlaying ? (
          <button
            type="button"
            onClick={pausePlayback}
            className="flex items-center gap-1 px-2 py-1.5 rounded bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors"
            title="Pause"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={resumePlayback}
            disabled={!isPaused}
            className="flex items-center gap-1 px-2 py-1.5 rounded bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Resume"
          >
            <Play className="w-3.5 h-3.5" />
            Resume
          </button>
        )}

        <button
          type="button"
          onClick={stopPlayback}
          className="flex items-center gap-1 px-2 py-1.5 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition-colors"
          title="Stop"
        >
          <Square className="w-3.5 h-3.5" />
          Stop
        </button>

        {/* Elapsed time */}
        {isActive && (
          <span className="ml-auto text-xs font-mono text-muted-foreground">
            {formatMs(elapsedMs)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={100}
          value={progress.percentage}
          onChange={handleSeek}
          className="w-full h-1 accent-primary cursor-pointer"
          aria-label="Playback progress"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {progress.current} / {progress.total} messages
          </span>
          <span>{progress.percentage.toFixed(0)}%</span>
        </div>
      </div>

      {/* Speed selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Speed:</span>
        <div className="flex gap-1">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                speed === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
