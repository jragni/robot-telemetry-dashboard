export interface MinimizedPanelBarProps {
  readonly isMinimized: (id: string) => boolean;
  readonly minimizedIds: ReadonlySet<string>;
  readonly onRestore: (id: string) => void;
}
