import type { ImuVariant } from '@/features/workspace/types/ImuPanel.types';

export interface DisconnectedOverlayProps {
  readonly robotName: string;
}

export interface ImuVizSelectProps {
  readonly value: ImuVariant;
  readonly onChange: (v: ImuVariant) => void;
}
