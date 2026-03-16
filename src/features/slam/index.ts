export { SlamMapWidget } from './components/SlamMapWidget';

export type {
  ParsedOccupancyGrid,
  RobotPosition,
  GridCell,
  ZoomTransform,
} from './slam.types';

export {
  MAP_DEFAULT_TOPIC,
  MAP_MESSAGE_TYPE,
  ODOM_DEFAULT_TOPIC,
  ODOM_MESSAGE_TYPE,
} from './slam.types';

export {
  parseOccupancyGrid,
  cellToColor,
  renderOccupancyGrid,
  worldToGrid,
  gridToCanvas,
  renderRobotMarker,
} from './slam.utils';
