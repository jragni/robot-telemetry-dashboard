import { useResponsiveSize } from '@/hooks/useResponsiveSize';

/** MOBILE_BREAKPOINT
 * @description Standard mobile breakpoint matching the project's md (768px).
 */
const MOBILE_BREAKPOINT = 768;

/** useIsMobile
 * @description Returns true when the viewport width is below the mobile
 *  breakpoint (768px). Delegates to useResponsiveSize for debounced,
 *  same-value-guarded viewport tracking.
 */
export function useIsMobile(): boolean {
  const width = useResponsiveSize(() => window.innerWidth);
  return width < MOBILE_BREAKPOINT;
}
