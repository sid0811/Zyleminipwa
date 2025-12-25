// Web-adapted utilHooks
import { Alert } from '@mui/material';
import { UserPreferenceKeys } from '../constants/asyncStorageKeys';
import cacheStorage from '../localstorage/secureStorage';
import { useTranslation } from 'react-i18next';
import { CODE_LIST } from '../constants/screenConstants';

export const versionChecking = async (
  res: any,
  setClientBasedURL: any,
  setSavedApiVersionAction: (payload: string) => void,
  setSavedAppendedApiVersionAction: (payload: string) => void,
  showAlert: () => void,
  t: any,
) => {
  console.log('🔍 [versionChecking] Starting version check');
  console.log('🔍 [versionChecking] Response data:', JSON.stringify(res?.data, null, 2));
  console.log('🔍 [versionChecking] ApiURL from response:', res?.data?.ApiURL);
  console.log('🔍 [versionChecking] ApiVersion from response:', res?.data?.ApiVersion);
  console.log('🔍 [versionChecking] AppendVersion from response:', res?.data?.AppendVersion);
  console.log('🔍 [versionChecking] Token from response:', res?.data?.Token ? 'PRESENT (length: ' + res?.data?.Token.length + ')' : 'MISSING');

  const apiURL = res?.data?.ApiURL;
  console.log('🔍 [versionChecking] Setting BASE_URL to:', apiURL);
  
  // CRITICAL: Await the storage operation to ensure BASE_URL is set before continuing
  await cacheStorage.set(UserPreferenceKeys.BASE_URL, apiURL);
  setClientBasedURL(apiURL);
  
  // Verify it was set
  const stored = await cacheStorage.getString(UserPreferenceKeys.BASE_URL);
  console.log('✅ [versionChecking] BASE_URL stored successfully:', stored);
  
  setSavedApiVersionAction(res?.data?.ApiVersion ? res?.data?.ApiVersion : '');
  setSavedAppendedApiVersionAction(
    res?.data?.AppendVersion ? res?.data?.AppendVersion : '',
  );
  
  if (
    res?.data?.code &&
    res?.data?.code === CODE_LIST.VERSION_MISMATCH_FORCE_UPDATE
  ) {
    setSavedAppendedApiVersionAction('');
    showAlert();
    
    // Web: Use browser confirm instead of Alert.alert
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const url = isIOS
      ? 'https://apps.apple.com/in/app/zylemini/id1553033579'
      : 'https://play.google.com/store/apps/details?id=com.zyleminiplus';
    
    if (window.confirm(
      `${t('Alerts.AlertAuthUpdateTile')}\n${t('Alerts.AlertAuthUpdateMsg')}`
    )) {
      window.open(url, '_blank');
    }
  }
};

export function stringToAscii(str: string) {
  let sumOfAllAscii = 0;
  for (let i = 0; i < str.length; i++) {
    sumOfAllAscii += str.charCodeAt(i);
  }
  return sumOfAllAscii;
}

