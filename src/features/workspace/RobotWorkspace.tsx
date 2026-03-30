import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { WorkspaceGrid } from './components/WorkspaceGrid';
import type { PanelConfig } from './components/WorkspaceGrid';
import { WORKSPACE_PANELS, IMU_VIZ_OPTIONS } from './constants';
import type { ImuVariant } from './constants';
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

/**
 * @description buildPanels — Builds the panel config array with content and optional
 *  footer actions.
 * @param name - Robot display name.
 * @param url - Rosbridge URL.
 * @param lastSeen - Last message timestamp.
 * @param connected - Whether robot is connected.
 * @param imuFooter - Footer actions element for the IMU panel.
 */
function buildPanels(
  name: string,
  url: string,
  lastSeen: number | null,
  connected: boolean,
  imuFooter?: ReactNode,
): PanelConfig[] {
  return WORKSPACE_PANELS.map((panel) => ({
    id: panel.id,
    label: panel.label,
    icon: panel.icon,
    topicName: panel.topicName,
    content: panelContent(panel.id, name, url, lastSeen, connected),
    footerActions: panel.id === 'imu' ? imuFooter : undefined,
  }));
}

/**
 * @description ImuVizSelect — Renders an IMU variant selector dropdown.
 * @param value - Currently selected variant.
 * @param onChange - Callback when selection changes.
 */
function ImuVizSelect({
  value,
  onChange,
}: {
  readonly value: ImuVariant;
  readonly onChange: (v: ImuVariant) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onChange(v as ImuVariant);
      }}
    >
      <SelectTrigger className="h-6 w-40 font-mono text-xs bg-surface-tertiary border-border px-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-surface-secondary border-border">
        {IMU_VIZ_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="font-mono text-xs"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * @description RobotWorkspace — Renders the workspace page for a single robot with
 *  6 configurable panels. IMU panel includes a visualization variant selector.
 */
export function RobotWorkspace() {
  const { id } = useParams<{ id: string }>();
  const robot = useConnectionStore((s) => (id ? s.robots[id] : undefined));
  const [imuVariant, setImuVariant] = useState<ImuVariant>('attitude-compass');

  const panels = useMemo(() => {
    if (!robot) return [];
    return buildPanels(
      robot.name,
      robot.url,
      robot.lastSeen,
      robot.status === 'connected',
      <ImuVizSelect value={imuVariant} onChange={setImuVariant} />,
    );
  }, [robot, imuVariant]);

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
