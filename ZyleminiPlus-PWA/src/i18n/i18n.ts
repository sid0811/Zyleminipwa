import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import hi from './languages/hi.json';
import en from './languages/en.json';
import { deviceLanguage } from '../utility/getAppLanguage';
import { UserPreferenceKeys } from '../constants/asyncStorageKeys';
import cacheStorage from '../localstorage/secureStorage';
import { writeErrorLog } from '../utility/utils';

export const resources = {
  hi: hi,
  en: en,
};

const languageDetector: any = {
  type: 'languageDetector',
  async: true,
  detect: (callBack: any) => {
    // Use browser language instead of react-native-localize
    const lang = deviceLanguage();
    return callBack(lang);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    returnEmptyString: false,
    compatibilityJSON: 'v3',
    partialBundledLanguages: true,
    ns: [],
  });

async function languageInitialize() {
  let lang = await cacheStorage.getString(UserPreferenceKeys.LANGUAGE);
  if (lang) {
    await changeAppLanguage(lang);
  } else {
    cacheStorage.setString(UserPreferenceKeys.LANGUAGE, 'en');
  }
}

export default { languageInitialize };

export const changeAppLanguage = async (lang: string) => {
  try {
    await i18n.changeLanguage(lang);
  } catch (error) {
    writeErrorLog('changeAppLanguage', error);
    console.log('Error', error);
  }
};

