export interface UseDataPlotResult {
  availableFields: string[];
  timestamps: number[];
  series: Record<string, number[]>;
}
