/**
 * Design System Theme Constants & Tokens
 *
 * Provides single-source-of-truth constants for typography, padding,
 * borders, container max-widths, and high-resolution responsive scales.
 */

export const THEME_SPACING = {
  // Container max widths across responsive breakpoints
  container: {
    base: 'max-w-5xl',
    xl: 'xl:max-w-6xl',
    '3xl': '3xl:max-w-7xl',
    '2k': '2k:max-w-[1700px]',
  },
  // Section and element gaps
  gap: {
    xs: 'gap-1.5 3xl:gap-2',
    sm: 'gap-2 sm:gap-3 3xl:gap-4',
    md: 'gap-4 sm:gap-6 3xl:gap-8 2k:gap-10',
    lg: 'gap-6 sm:gap-8 3xl:gap-10 2k:gap-12',
  },
  // Card paddings
  cardPadding: {
    sm: 'p-3 sm:p-4 3xl:p-5 2k:p-6',
    md: 'p-4 sm:p-6 3xl:p-8 2k:p-10',
    lg: 'p-6 sm:p-8 3xl:p-10 2k:p-14',
  },
  // Button paddings
  buttonPadding: {
    sm: 'px-2.5 py-1.5 sm:px-3 sm:py-2 3xl:px-4 3xl:py-2.5',
    md: 'px-3 py-2 sm:px-4 sm:py-2.5 3xl:px-5 3xl:py-3 2k:px-6 2k:py-3.5',
    lg: 'px-5 py-2.5 sm:px-6 sm:py-3 3xl:px-8 3xl:py-4 2k:px-10 2k:py-5',
  },
} as const;

export const THEME_TYPOGRAPHY = {
  // Fixed design system font size tokens
  sizes: {
    xs: 'text-xs 3xl:text-sm 2k:text-base',
    sm: 'text-xs sm:text-sm 3xl:text-base 2k:text-lg',
    base: 'text-sm sm:text-base 3xl:text-lg 2k:text-xl',
    lg: 'text-base sm:text-lg 3xl:text-xl 2k:text-2xl',
    xl: 'text-lg sm:text-xl 3xl:text-2xl 2k:text-3xl',
    '2xl': 'text-xl sm:text-2xl 3xl:text-3xl 2k:text-4xl',
    '3xl': 'text-2xl sm:text-3xl 3xl:text-4xl 2k:text-5xl',
  },
  // Typing canvas font sizes per user scale preference
  typingCanvas: {
    standard: 'text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl 2k:text-6xl',
    large: 'text-3xl sm:text-4xl md:text-5xl 3xl:text-6xl 2k:text-7xl',
    huge: 'text-4xl sm:text-5xl md:text-6xl 3xl:text-7xl 2k:text-8xl',
  },
} as const;

export const THEME_RADIUS = {
  sm: 'rounded-md 3xl:rounded-lg',
  md: 'rounded-lg 3xl:rounded-xl',
  lg: 'rounded-xl 3xl:rounded-2xl',
  xl: 'rounded-2xl 3xl:rounded-3xl',
} as const;

