import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { WorkspaceGrid } from './components/WorkspaceGrid';
import type { PanelConfig } from './components/WorkspaceGrid';
import { WORKSPACE_PANELS } from './constants';
import { MockCamera } from './mocks/MockCamera';
import { MockLidar } from './mocks/MockLidar';
import { MockControls } from './mocks/MockControls';
import { MockTelemetry } from './mocks/MockTelemetry';
import { AnimatedMockImu } from './mocks/MockImu';
import { MockSystemStatus } from './mocks/MockSystemStatus';

function DisconnectedOverlay({ robotName }: { robotName: string }) {
  return (
    <span className="font-mono text-xs text-text-muted text-center">
      {robotName} is not connected
    </span>
  );
}

function panelContent(
  id: string,
  name: string,
  url: string,
  lastSeen: number | null,
  connected: boolean,
): ReactNode {
  if (id === 'status') {
    return (
      <MockSystemStatus
        name={name}
        url={url}
        lastSeen={lastSeen}
        connected={connected}
      />
    );
  }
  if (!connected) {
    return <DisconnectedOverlay robotName={name} />;
  }
  switch (id) {
    case 'camera':
      return <MockCamera />;
    case 'lidar':
      return <MockLidar />;
    case 'imu':
      return <AnimatedMockImu />;
    case 'controls':
      return <MockControls />;
    case 'telemetry':
      return <MockTelemetry />;
    default:
      return null;
  }
}

function buildPanels(
  name: string,
  url: string,
  lastSeen: number | null,
  connected: boolean,
): PanelConfig[] {
  return WORKSPACE_PANELS.map((panel) => ({
    id: panel.id,
    label: panel.label,
    icon: panel.icon,
    topicName: panel.topicName,
    content: panelContent(panel.id, name, url, lastSeen, connected),
  }));
}

/**
 *
 */
export function RobotWorkspace() {
  const { id } = useParams<{ id: string }>();
  const robot = useConnectionStore((s) => (id ? s.robots[id] : undefined));

  const panels = useMemo(() => {
    if (!robot) return [];
    return buildPanels(
      robot.name,
      robot.url,
      robot.lastSeen,
      robot.status === 'connected',
    );
  }, [robot]);

  if (!robot) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="font-mono text-xs text-text-muted">
          Robot not found: {id}
        </span>
        <Link
          to="/fleet"
          className="font-mono text-xs text-accent hover:underline"
        >
          Back to Fleet
        </Link>
      </div>
    );
  }

  return <WorkspaceGrid key={id} panels={panels} />;
}
