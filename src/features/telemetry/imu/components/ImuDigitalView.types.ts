import type { ImuDerivedData } from '../imu.types';

export interface ImuDigitalViewProps {
  data: ImuDerivedData;
}

export interface MetricRowProps {
  label: string;
  value: string;
  unit: string;
  valueClassName?: string;
}

export interface ImuSectionProps {
  title: string;
  children: React.ReactNode;
}
