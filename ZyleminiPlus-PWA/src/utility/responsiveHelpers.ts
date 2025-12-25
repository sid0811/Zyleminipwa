/**
 * Web replacements for react-native-responsive-screen
 * Converts percentage to viewport units for web
 */

/**
 * Height percentage to viewport height
 * @param percentage - Percentage value (number or string like '2' or 2)
 * @returns CSS value string like '2vh'
 */
export const hp = (percentage: number | string): string => {
  const numPercent = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  return `${numPercent}vh`;
};

/**
 * Width percentage to viewport width
 * @param percentage - Percentage value (number or string like '2' or 2)
 * @returns CSS value string like '2vw'
 */
export const wp = (percentage: number | string): string => {
  const numPercent = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  return `${numPercent}vw`;
};

/**
 * Dimensions helper (web replacement for React Native Dimensions)
 */
export const Dimen = {
  FontSizeSmall: '12px',
  FontSizeMedium: '14px',
  FontSizeLarge: '16px',
  FontSizeXLarge: '18px',
  FontSizeXXLarge: '20px',
};

