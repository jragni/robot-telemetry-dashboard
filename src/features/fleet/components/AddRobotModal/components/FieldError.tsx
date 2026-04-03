
import type { FieldErrorProps } from '../types/FieldError.types';

/** FieldError
 * @description Renders an inline validation error below a form field.
 *  Uses aria role for screen reader announcement.
 * @param id - The stable ID for aria-describedby linkage.
 * @param message - The error message to display, or undefined if no error.
 */
export function FieldError({ id, message }: FieldErrorProps) {
  return (
    <>
      {!!message && (
        <p id={id} className="font-mono text-xs text-status-critical mt-1" role="alert">
          {message}
        </p>
      )}
    </>
  );
}
