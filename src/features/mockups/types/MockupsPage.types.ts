import type { LucideIcon } from 'lucide-react';

/** MockSection
 * @description Defines a navigable section within the mockups page.
 */
export interface MockSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
}

/** ColorTokenGroup
 * @description Groups design tokens by namespace for the color swatches display.
 */
export interface ColorTokenGroup {
  readonly namespace: string;
  readonly tokens: readonly string[];
}

/** TypographySample
 * @description Defines a typography size sample with metadata.
 */
export interface TypographySample {
  readonly sizePx: number;
  readonly tailwindClass: string;
  readonly label: string;
}

/** StatusState
 * @description Defines a status indicator state with triple-redundant visuals.
 */
export interface StatusState {
  readonly label: string;
  readonly Icon: LucideIcon;
  readonly colorClass: string;
  readonly bgClass: string;
  readonly dotClass: string;
}

/** ButtonVariantDemo
 * @description Defines a button variant for the showcase grid.
 */
export interface ButtonVariantDemo {
  readonly label: string;
  readonly variant: 'default' | 'secondary' | 'destructive' | 'ghost' | 'outline';
}

/** SpacingStep
 * @description Defines a spacing scale step with pixel and Tailwind values.
 */
export interface SpacingStep {
  readonly px: number;
  readonly tailwindClass: string;
}

/** TelemetryDataPoint
 * @description A single telemetry data point with timestamp and value.
 */
export interface TelemetryDataPoint {
  readonly timestamp: number;
  readonly value: number;
}

/** MockTelemetryData
 * @description Return type of the useMockTelemetry hook.
 */
export interface MockTelemetryData {
  readonly batteryLevel: number;
  readonly uptimeSeconds: number;
  readonly imu: {
    readonly roll: number;
    readonly pitch: number;
    readonly yaw: number;
  };
  readonly linearVelocity: number;
  readonly angularVelocity: number;
  readonly lidarPoints: readonly { angle: number; distance: number }[];
  readonly telemetrySeries: readonly {
    label: string;
    color: string;
    data: TelemetryDataPoint[];
  }[];
}

/** MockupSectionProps
 * @description Props for the reusable MockupSection wrapper.
 */
export interface MockupSectionProps {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
}

/** IconEntry
 * @description An icon entry for the icon grid display.
 */
export interface IconEntry {
  readonly name: string;
  readonly Icon: LucideIcon;
}

/** BorderEffect
 * @description A border effect sample for the border effects showcase.
 */
export interface BorderEffect {
  readonly label: string;
  readonly className: string;
}

/** AnimationEntry
 * @description An animation sample for the animation showcase.
 */
export interface AnimationEntry {
  readonly label: string;
  readonly className: string;
}
