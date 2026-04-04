import { Component, type ErrorInfo } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ErrorBoundaryProps, ErrorBoundaryState } from '@/types/ErrorBoundary.types';


/** ErrorBoundary
 * @description Catches unhandled errors in the React component tree and renders
 *  a full-page fallback with error details and a reload button.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-surface-base p-8">
          <section className="flex max-w-md flex-col items-center gap-6 text-center">
            <AlertOctagon
              className="size-12 text-status-critical"
              aria-hidden="true"
            />
            <h1 className="font-sans text-xl font-semibold text-text-primary">
              Something went wrong
            </h1>
            <p className="font-sans text-sm text-text-secondary">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <Button
              variant="outline"
              onClick={this.handleReload}
              className="cursor-pointer transition focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Reload page"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              <span className="font-sans text-sm">Reload</span>
            </Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
