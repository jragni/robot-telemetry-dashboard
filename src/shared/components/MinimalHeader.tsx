import { Show } from './Show';

export interface MinimalHeaderProps {
  activeRobotId?: string;
}

export function MinimalHeader({ activeRobotId }: MinimalHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border bg-card px-4">
      <h1 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground">
        Robot Telemetry Dashboard
      </h1>

      <Show when={!!activeRobotId}>
        <div
          className="ml-auto flex items-center gap-2"
          data-testid="active-robot-status"
        >
          <span className="font-mono text-xs text-muted-foreground">
            {activeRobotId}
          </span>
        </div>
      </Show>
    </header>
  );
}
