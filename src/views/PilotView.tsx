import { useParams } from 'react-router';

export function PilotView() {
  const { robotId } = useParams<{ robotId: string }>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-lg">Pilot Mode — Robot: {robotId}</p>
    </div>
  );
}
