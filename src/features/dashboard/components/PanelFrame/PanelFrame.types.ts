export interface PanelFrameProps {
  panelId: string;
  title: string;
  children: React.ReactNode;
  onClose?: (panelId: string) => void;
  onReset?: () => void;
  onTabWith?: () => void;
  isSovereign?: boolean;
  isClosable?: boolean;
  showDragHandle?: boolean;
}
