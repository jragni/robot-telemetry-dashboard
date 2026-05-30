export interface BatteryStatus {
  readonly percentage: number | null;
  readonly voltage: number | null;
  readonly charging: boolean;
}
