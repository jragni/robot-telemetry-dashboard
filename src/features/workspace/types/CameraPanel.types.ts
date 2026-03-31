export interface CameraPanelProps {
  readonly streamRef?: React.RefObject<HTMLVideoElement>;
  readonly connected: boolean;
  readonly label?: string;
}
