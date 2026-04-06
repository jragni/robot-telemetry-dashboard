export interface BatteryRowProps {
  readonly percentage: number | null;
}

export interface ConnectionRowProps {
  readonly label: string;
  readonly connected: boolean;
}
