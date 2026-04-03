export interface ROSHeader {
  readonly seq: number;
  readonly stamp: {
    readonly secs: number;
    readonly nsecs: number;
  };
  readonly frame_id: string;
}

export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Quaternion {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}
