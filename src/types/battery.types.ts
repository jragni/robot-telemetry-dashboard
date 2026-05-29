export interface BatteryStatus {
  readonly percentage: number | null;
  readonly voltage: number;
  readonly charging: boolean;
}
