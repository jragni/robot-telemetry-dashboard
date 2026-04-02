export interface ExpandableRowProps {
  readonly label: string;
  readonly count: number;
  readonly names: readonly string[];
  readonly expanded: boolean;
  readonly onToggle: () => void;
}
