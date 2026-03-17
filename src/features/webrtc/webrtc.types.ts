/**
 * Signaling error thrown by SignalingClient on fetch failures.
 */
export class SignalingError extends Error {
  override readonly name = 'SignalingError' as const;
  readonly statusCode?: number;
  readonly code: string;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
