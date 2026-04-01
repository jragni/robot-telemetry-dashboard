import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

/** Toaster
 * @description Wraps Sonner's toast container with the app's theme and
 *  Midnight Operations styling.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-center"
      icons={{
        success: <CircleCheckIcon className="size-4 text-status-nominal" />,
        info: <InfoIcon className="size-4 text-accent" />,
        warning: <TriangleAlertIcon className="size-4 text-status-caution" />,
        error: <OctagonXIcon className="size-4 text-status-critical" />,
        loading: <Loader2Icon className="size-4 animate-spin text-accent" />,
      }}
      toastOptions={{
        className: 'font-mono text-xs cursor-pointer',
      }}
      style={
        {
          '--normal-bg': 'var(--color-surface-primary)',
          '--normal-text': 'var(--color-text-primary)',
          '--normal-border': 'var(--color-border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
