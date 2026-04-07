export interface AddRobotFormErrors {
  readonly name?: string;
  readonly url?: string;
  readonly form?: string;
}

export interface ValidateSuccess {
  ok: true;
  name: string;
  url: string;
}

export interface ValidateFailure {
  ok: false;
  errors: AddRobotFormErrors;
}
