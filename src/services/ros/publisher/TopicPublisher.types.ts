export interface TopicPublisherHandle<T> {
  /** Wraps `message` in a ROSLIB.Message and publishes it to the ROS topic. */
  publish: (message: T) => void;
  /** Calls unadvertise on the underlying ROSLIB.Topic and releases resources. */
  destroy: () => void;
}
