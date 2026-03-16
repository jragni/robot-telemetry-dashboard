import { useParams } from 'react-router';

export function PilotView() {
  const { robotId } = useParams<{ robotId: string }>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100">
      <p className="text-lg">Pilot Mode — Robot: {robotId}</p>
    </div>
  );
}
