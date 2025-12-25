// Web-adapted typography
import { Colors } from './colors';

/**
 * normalize function returns font size (web doesn't need font scale normalization)
 */
export function normalize(size: number): number {
  return size;
}

// Web: Use viewport dimensions
export const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
export const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

export const fontsSize = {
  verySmall: 10,
  small: 12,
  smallDefault: 13,
  default: 14,
  medium: 16,
  large: 18,
  extraLarge: 20,
  extraLarger: 24,
  mainHeadinSize: 30,
  ratingSize: 48,
};

/**
 * fontFamily returns fonts style according to platform
 */
export const fontFamily = () => {
  return {
    ReemrKufiBold: 'ReemKufi-Bold, sans-serif',
    Reemregular: 'ReemKufiInk-Regular, sans-serif',
    ProximaNova: 'Proxima Nova, sans-serif',
    Interregular: 'Inter-Regular, sans-serif',
    InterBlack: 'Inter-Black, sans-serif',
    InterBold: 'Inter-Bold, sans-serif',
    InterLight: 'Inter-Light, sans-serif',
  };
};

/**
 * Custom font styles for web (using CSS-in-JS)
 */
export const CustomFontStyle = (isDarkMode?: boolean | undefined) => ({
  mainTitle: {
    color: isDarkMode ? Colors.white : Colors.black,
    fontSize: fontsSize.mainHeadinSize,
    fontFamily: fontFamily().ProximaNova,
  },
  greatingDash: {
    color: Colors.white,
    fontSize: fontsSize.large,
    fontFamily: fontFamily().ProximaNova,
  },
  topDashCard: {
    color: Colors.darkGreen,
    fontSize: fontsSize.small,
    fontFamily: fontFamily().ProximaNova,
  },
  titleExtraLarge: {
    color: Colors.white,
    fontSize: fontsSize.extraLarge,
    fontFamily: fontFamily().ProximaNova,
  },
});


