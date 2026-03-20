export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Twist {
  linear: Vector3;
  angular: Vector3;
}

export interface TopicInfo {
  name: string;
  type: string;
}
