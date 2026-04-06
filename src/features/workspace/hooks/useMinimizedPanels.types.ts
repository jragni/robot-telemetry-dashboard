export interface UseMinimizedPanelsReturn {
  readonly isMinimized: (id: string) => boolean;
  readonly isMaximized: (id: string) => boolean;
  readonly minimize: (id: string) => void;
  readonly restore: (id: string) => void;
  readonly maximize: (id: string) => void;
  readonly restoreAll: () => void;
  readonly minimizedIds: ReadonlySet<string>;
  readonly maximizedId: string | null;
}
