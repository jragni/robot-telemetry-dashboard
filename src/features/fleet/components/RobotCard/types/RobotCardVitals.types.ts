import type { BatteryStatus } from '@/types/battery.types';

export interface RobotCardVitalsProps {
  readonly battery: BatteryStatus | null;
}
