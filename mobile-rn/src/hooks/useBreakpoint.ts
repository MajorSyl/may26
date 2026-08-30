import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// Mirrors Tailwind's default md (768) / lg (1024) breakpoints, since
// NativeWind's responsive className variants (md:, lg:) use those same
// thresholds -- keeping this hook in sync with them so screens can branch
// on layout *structure* (e.g. bottom tabs vs. a side rail) while classNames
// handle the *styling* differences (column counts, spacing) at the same
// breakpoints.
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}
