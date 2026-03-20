import { useParams } from 'react-router';

export function PilotView() {
  const { robotId } = useParams<{ robotId: string }>();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <h2 className="font-mono text-lg font-bold uppercase tracking-wider text-foreground">
        Pilot Mode
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Controlling robot: {robotId}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Fullscreen pilot interface coming in Phase 9
      </p>
    </div>
  );
}
