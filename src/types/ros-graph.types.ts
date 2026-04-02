/** RosGraph
 * @description Counts and names of active ROS computational graph entities.
 */
export interface RosGraph {
  readonly nodes: number;
  readonly nodeNames: readonly string[];
  readonly topics: number;
  readonly topicNames: readonly string[];
  readonly services: number;
  readonly serviceNames: readonly string[];
  readonly actions: number;
  readonly actionNames: readonly string[];
}
