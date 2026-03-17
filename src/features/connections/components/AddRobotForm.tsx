import { useState } from 'react';

import { useFleetConnectionManager } from '@/hooks/useFleetConnectionManager';
import { useConnectionsStore } from '@/stores/connections/connections.store';

// ---------------------------------------------------------------------------
// AddRobotForm
// ---------------------------------------------------------------------------

/**
 * Simple form that lets the user configure a new robot by name and base URL,
 * adds it to the connections store, and immediately initiates a connection.
 */
export function AddRobotForm() {
  const { connectRobot } = useFleetConnectionManager();

  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedUrl = baseUrl.trim();

    if (!trimmedName) {
      setError('Robot name is required.');
      return;
    }
    if (!trimmedUrl) {
      setError('Base URL is required.');
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError('Enter a valid URL (e.g. ws://192.168.1.10:9090).');
      return;
    }

    setError(null);
    // Use getState() to call the store action directly — avoids the
    // @typescript-eslint/unbound-method warning when extracting methods
    // via useConnectionsStore selector.
    const id = useConnectionsStore
      .getState()
      .addRobot({ name: trimmedName, baseUrl: trimmedUrl });
    connectRobot(id);

    setName('');
    setBaseUrl('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Add robot"
      className="flex flex-col gap-2 p-3"
    >
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
        Add Robot
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Robot name"
        aria-label="Robot name"
        className="h-7 w-full rounded border border-border bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />

      <input
        type="text"
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        placeholder="ws://192.168.1.10:9090"
        aria-label="Base URL"
        className="h-7 w-full rounded border border-border bg-background px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {error !== null && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="h-7 w-full rounded bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary"
      >
        Add &amp; Connect
      </button>
    </form>
  );
}
