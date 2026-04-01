export interface VelocitySliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly unit: string;
  readonly disabled: boolean;
  readonly onChange: (value: number) => void;
}
