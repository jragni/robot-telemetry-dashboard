export type ImuVariant = 'attitude-compass' | 'numbers' | 'attitude' | '3d';

export interface ImuOrientation {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
}

export interface AttitudeIndicatorProps {
  readonly roll: number;
  readonly pitch: number;
}

export interface CompassHeadingProps {
  readonly yaw: number;
}

export interface AttitudeViewProps extends Omit<ImuOrientation, 'yaw'> {
  readonly yaw?: number;
}

export type NumbersViewProps = ImuOrientation;

export type AttitudeCompassViewProps = ImuOrientation;

export type WireframeViewProps = ImuOrientation;

export interface ImuVizSelectProps {
  readonly value: ImuVariant;
  readonly onChange: (v: ImuVariant) => void;
}

export interface ImuPanelProps extends ImuOrientation {
  readonly connected: boolean;
}
