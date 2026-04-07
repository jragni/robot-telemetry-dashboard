import { useResponsiveSize } from '../useResponsiveSize';

const MOBILE_BREAKPOINT = 768;

/** useIsMobile
 * @description Returns true when the viewport width is below the mobile breakpoint (768px).
 */
export function useIsMobile(): boolean {
  const width = useResponsiveSize(() => window.innerWidth);
  return width < MOBILE_BREAKPOINT;
}
