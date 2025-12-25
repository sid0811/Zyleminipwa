// Web-adapted getAppLanguage.ts
import {writeErrorLog} from './utils';

export const deviceLanguage = () => {
  try {
    // Web: Use browser language API
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang) {
      // Return language code (e.g., 'en', 'hi')
      return browserLang.split('-')[0];
    }
    return 'en'; // Default to English
  } catch (error) {
    writeErrorLog('deviceLanguage', error);
    console.log('Lang Error: ', error);
    return 'en';
  }
};
