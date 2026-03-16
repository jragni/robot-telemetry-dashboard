export { DataPlotWidget } from './components/DataPlotWidget';
export { useDataPlot } from './hooks/useDataPlot';
export type { UseDataPlotResult } from './hooks/useDataPlot';
export {
  detectPlotStrategy,
  extractNumericPaths,
  extractSample,
} from './data-plot.utils';
export type {
  PlotStrategyId,
  PlotStrategy,
  NumericPath,
  PlotSample,
} from './data-plot.types';
