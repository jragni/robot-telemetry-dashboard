import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PanelErrorBoundaryProps {
  children: ReactNode;
}

interface PanelErrorBoundaryState {
  hasError: boolean;
}

/** PanelErrorBoundary
 * @description Catches errors within a workspace panel and renders a compact
 *  fallback with a retry button that resets the error state.
 */
export class PanelErrorBoundary extends Component<PanelErrorBoundaryProps, PanelErrorBoundaryState> {
  constructor(props: PanelErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): PanelErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[PanelErrorBoundary]', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="flex h-full w-full flex-col items-center justify-center gap-3">
          <AlertTriangle
            className="size-8 text-status-caution"
            aria-hidden="true"
          />
          <p className="font-sans text-sm font-semibold text-text-secondary">
            Panel Error
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={this.handleRetry}
            className="cursor-pointer transition focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Retry loading panel"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            <span className="font-sans text-xs">Retry</span>
          </Button>
        </section>
      );
    }

    return this.props.children;
  }
}
