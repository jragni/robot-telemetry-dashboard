export interface CameraPanelProps {
  readonly streamRef?: React.RefObject<HTMLVideoElement | null>;
  readonly connected: boolean;
  readonly label?: string;
}
