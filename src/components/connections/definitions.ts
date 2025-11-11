// Connection component prop types

export interface AddRobotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ConnectionsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ConnectionSettingsProps {
  onClose?: () => void;
}
