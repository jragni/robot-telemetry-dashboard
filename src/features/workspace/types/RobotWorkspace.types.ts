import type { ImuVariant } from '../constants';

export interface DisconnectedOverlayProps {
  readonly robotName: string;
}

export interface ImuVizSelectProps {
  readonly value: ImuVariant;
  readonly onChange: (v: ImuVariant) => void;
}
