export interface AddRobotFormData {
  readonly name: string;
  readonly url: string;
}

export interface AddRobotFormErrors {
  readonly name?: string;
  readonly url?: string;
  readonly form?: string;
}
