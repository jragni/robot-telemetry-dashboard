import { AlertCircle } from 'lucide-react';

import type { FormErrorProps } from '../types/FormError.types';

/** FormError
 * @description Renders a form-level error alert with troubleshooting hint.
 * @param message - The error message to display.
 */
export function FormError({ message }: FormErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-sm border border-status-critical/30 bg-status-critical/10 px-3 py-2"
    >
      <AlertCircle size={14} className="text-status-critical shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <p className="font-mono text-xs text-status-critical">{message}</p>
        <p className="font-sans text-xs text-text-muted">
          Check the URL and ensure the robot is powered on.
        </p>
      </div>
    </div>
  );
}
