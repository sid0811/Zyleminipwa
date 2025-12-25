import cacheStorage from '../localstorage/secureStorage';
import {UserPreferenceKeys} from '../constants/asyncStorageKeys';
import axios from 'axios';
import {AUTH_ENDPOINTS} from '../constants/APIEndPoints';

const createAuthApiClient = async () => {
  const AuthBaseURL = AUTH_ENDPOINTS.AUTH_URL;
  const userId = await cacheStorage.getString(UserPreferenceKeys.LOGIN_USER_ID);

  console.log('🔐 [Auth.ts] Creating AuthApiClient');
  console.log('🔐 [Auth.ts] AuthBaseURL (static):', AuthBaseURL);
  console.log('🔐 [Auth.ts] LogUserId:', userId || 'NOT SET (expected for first call)');

  const client = axios.create({
    baseURL: AuthBaseURL,
    timeout: 500000,
    headers: {
      'Content-Type': 'application/json',
      LogUserId: userId ? userId : '',
    },
  });
  
  console.log('✅ [Auth.ts] AuthApiClient created with baseURL:', AuthBaseURL);
  
  return client;
};

export default createAuthApiClient;

