import { LidarPanel } from '@/features/workspace/components/LidarPanel/LidarPanel';
import { TelemetryPanel } from '@/features/workspace/components/TelemetryPanel';
import { CameraPanel } from '@/features/workspace/components/CameraPanel';
import { ImuPanel } from '@/features/workspace/components/ImuPanel/ImuPanel';
import { useMockTelemetry } from '../hooks/useMockTelemetry';

/** PanelShowcase
 * @description Renders all six workspace panels with mock data in fixed-size
 *  containers. Uses actual panel components where feasible and simplified
 *  recreations for panels with complex callback requirements.
 */
export function PanelShowcase() {
  const telemetry = useMockTelemetry();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <PanelFrame label="SystemStatusPanel">
        <dl className="flex flex-col gap-2 font-mono text-xs w-full px-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold text-text-primary">Demo Robot</span>
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full bg-status-nominal motion-safe:animate-pulse"
                aria-hidden="true"
              />
              <span className="text-status-nominal">CONNECTED</span>
            </div>
          </div>
          <span className="font-mono text-xs text-text-muted truncate">ws://localhost:9090</span>
          <div className="border-t border-border border-dashed my-1" />
          <MockStatusRow label="UPTIME" value="1h 02m 22s" />
          <MockStatusRow label="BATTERY" value={`${String(Math.round(telemetry.batteryLevel))}%`} />
          <div className="border-t border-border border-dashed my-1" />
          <MockStatusRow label="NODES" value="12" />
          <MockStatusRow label="TOPICS" value="34" />
          <MockStatusRow label="SERVICES" value="8" />
        </dl>
      </PanelFrame>

      <PanelFrame label="ControlsPanel">
        <div className="flex flex-col items-center gap-4 w-full px-2 pt-1">
          <div className="flex flex-col items-center gap-1">
            <div className="grid grid-cols-3 gap-1">
              <span />
              <MockDpadBtn text="W" />
              <span />
              <MockDpadBtn text="A" />
              <MockDpadBtn text="S" />
              <MockDpadBtn text="D" />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-text-muted">LINEAR</span>
              <span className="font-mono text-xs text-text-primary tabular-nums">
                {telemetry.linearVelocity.toFixed(2)} m/s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-text-muted">ANGULAR</span>
              <span className="font-mono text-xs text-text-primary tabular-nums">
                {telemetry.angularVelocity.toFixed(2)} rad/s
              </span>
            </div>
          </div>
        </div>
      </PanelFrame>

      <PanelFrame label="ImuPanel">
        <ImuPanel
          roll={telemetry.imu.roll}
          pitch={telemetry.imu.pitch}
          yaw={telemetry.imu.yaw}
          connected
        />
      </PanelFrame>

      <PanelFrame label="LidarPanel">
        <LidarPanel
          points={telemetry.lidarPoints as { angle: number; distance: number }[]}
          rangeMax={5}
          connected
        />
      </PanelFrame>

      <PanelFrame label="TelemetryPanel">
        <TelemetryPanel
          series={telemetry.telemetrySeries as { label: string; color: string; data: { timestamp: number; value: number }[] }[]}
          timeWindowMs={10000}
          connected
        />
      </PanelFrame>

      <PanelFrame label="CameraPanel">
        <CameraPanel connected={false} label="/camera/rgb/image_raw" />
      </PanelFrame>
    </div>
  );
}

/** PanelFrame
 * @description Wraps a panel demo in a fixed-height container with a label.
 * @param label - The panel name to display.
 * @param children - The panel content.
 */
function PanelFrame({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs text-text-muted">{label}</span>
      <div className="border border-border rounded-sm bg-surface-secondary h-96 overflow-hidden p-2 flex flex-col">
        {children}
      </div>
    </div>
  );
}

/** MockStatusRow
 * @description Renders a simplified status row for the SystemStatusPanel recreation.
 * @param label - The row label.
 * @param value - The row value.
 */
function MockStatusRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-xs text-text-muted">{label}</span>
      <span className="font-mono text-xs text-text-primary tabular-nums">{value}</span>
    </div>
  );
}

/** MockDpadBtn
 * @description Renders a simplified D-pad button for the ControlsPanel recreation.
 * @param text - The button label text.
 */
function MockDpadBtn({ text }: { readonly text: string }) {
  return (
    <div className="size-8 rounded-sm bg-surface-tertiary border border-border flex items-center justify-center">
      <span className="font-mono text-xs text-text-primary">{text}</span>
    </div>
  );
}
