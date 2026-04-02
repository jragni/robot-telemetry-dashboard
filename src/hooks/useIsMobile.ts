import { useResponsiveSize } from '@/hooks/useResponsiveSize';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const width = useResponsiveSize(() => window.innerWidth);
  return width < MOBILE_BREAKPOINT;
}
