import {AUTH_ENDPOINTS} from '../constants/APIEndPoints';
import createApiClient from './Client';
import { writeErrorLog } from '../utility/utils';
import cacheStorage from '../localstorage/secureStorage';
import { UserPreferenceKeys } from '../constants/asyncStorageKeys';
import axios from 'axios';

export const postAuthLogin = async (headers: any) => {
  console.log('🔐 [LoginAPICalls] Creating axios client for postAuthLogin...');
  
  // Validate headers before proceeding
  if (!headers || !headers.authheader || !headers.LoginId || !headers.Password) {
    const errorMsg = 'Required headers are missing for login API call.';
    console.error('❌ [LoginAPICalls]', errorMsg, {
      hasHeaders: !!headers,
      hasAuthheader: !!headers?.authheader,
      hasLoginId: !!headers?.LoginId,
      hasPassword: !!headers?.Password,
    });
    throw new Error(errorMsg);
  }
  
  // Get BASE_URL from storage
  await new Promise(resolve => setTimeout(resolve, 50));
  const baseURL = await cacheStorage.getString(UserPreferenceKeys.BASE_URL);
  
  if (!baseURL) {
    const errorMsg = 'BASE_URL is not set. Cannot make login API call.';
    console.error('❌ [LoginAPICalls]', errorMsg);
    throw new Error(errorMsg);
  }
  
  // IMPORTANT: In production, use Vercel proxy to avoid CORS issues
  // In development, use Vite proxy (relative path)
  const isDevelopment = import.meta.env.DEV;
  const fullURL = baseURL + AUTH_ENDPOINTS.LOGIN_EP;
  
  console.log('🔐 [LoginAPICalls] BASE_URL:', baseURL);
  console.log('🔐 [LoginAPICalls] Endpoint:', AUTH_ENDPOINTS.LOGIN_EP);
  console.log('🔐 [LoginAPICalls] Full URL:', fullURL);
  console.log('🔐 [LoginAPICalls] Is development:', isDevelopment);
  
  // Validate URL contains expected pattern
  if (!fullURL.includes('WINDSRBV1V4') && !fullURL.includes('WINDSR')) {
    console.warn('⚠️ [LoginAPICalls] URL does not contain expected WINDSR pattern!');
  }
  
  console.log('🔐 [LoginAPICalls] Headers being sent:', JSON.stringify(headers, null, 2));
  console.log('🔐 [LoginAPICalls] authheader in headers:', headers?.authheader ? 'PRESENT (length: ' + headers.authheader.length + ')' : 'MISSING');
  
  let response;
  
  if (isDevelopment) {
    // Development: Use relative path to trigger Vite proxy
    console.log('🔐 [LoginAPICalls] Development mode - using Vite proxy');
    try {
      const url = new URL(baseURL);
      const relativePath = url.pathname + AUTH_ENDPOINTS.LOGIN_EP;
      console.log('🔐 [LoginAPICalls] Using relative path for proxy:', relativePath);
      
      const apiClient = axios.create({
        baseURL: relativePath,
        timeout: 500000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      response = await apiClient.post('', null, {
        headers,
        transformRequest: [(data) => {
          if (data === null || data === undefined) {
            return '';
          }
          return data;
        }],
      });
    } catch (error: any) {
      console.error('❌ [LoginAPICalls] Proxy request failed, trying direct URL:', error);
      throw error;
    }
  } else {
    // Production: Use Vercel serverless function proxy to avoid CORS
    console.log('🔐 [LoginAPICalls] Production mode - using Vercel proxy');
    
    const apiClient = axios.create({
      baseURL: '/api/proxy',
      timeout: 500000,
      headers: {
        'Content-Type': 'application/json',
        'x-target-url': fullURL, // Pass target URL in header
      },
    });
    
    response = await apiClient.post('', null, {
      headers,
      transformRequest: [(data) => {
        if (data === null || data === undefined) {
          return '';
        }
        return data;
      }],
    });
  }
  
  console.log('✅ [LoginAPICalls] Response received');
  console.log('✅ [LoginAPICalls] Status:', response?.status);
  console.log('✅ [LoginAPICalls] Response data keys:', Object.keys(response?.data || {}));
  console.log('✅ [LoginAPICalls] Full response data:', JSON.stringify(response?.data, null, 2));
  
  return response.data;
};

export const postOTP = async (headers: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(AUTH_ENDPOINTS.OTP_EP, null, {
    headers,
  });
  return response.data;
};

export const postAuthToken = async (headers: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(AUTH_ENDPOINTS.TOKEN_EP, null, {
    headers,
  });
  return response;
};
export const postData = async (data: any, token?: string): Promise<any> => {
  try {
    console.log('🚀 POST REQUEST: Starting data sync...');
    const dataSizeKB = JSON.stringify(data).length / 1024;
    const dataSizeMB = dataSizeKB / 1024;
    console.log(`📊 Data size: ${dataSizeMB.toFixed(2)}MB (${dataSizeKB.toFixed(1)}KB, ${JSON.stringify(data).length} characters)`);
    console.log('📋 Data keys:', Object.keys(data));
    if (token) {
      console.log('🔐 Using authentication token');
    }
    
    const apiClient = await createApiClient();
    
    const config: any = {};
    if (token) {
      config.headers = {
        'Content-Type': 'application/json',
        'authheader': token,
      };
    }
    
    console.log(`🌐 AXIOS REQUEST START: ${new Date().toISOString()}`);
    const axiosStartTime = Date.now();
    
    const response = await apiClient.post(AUTH_ENDPOINTS.POSTDATA_EP, data, config);
    
    const axiosDuration = Date.now() - axiosStartTime;
    console.log(`✅ AXIOS RESPONSE: Data sync completed in ${axiosDuration}ms`);
    console.log(`🌐 AXIOS RESPONSE TIME: ${new Date().toISOString()}`);
    console.log('📈 Response status:', response.status);
    console.log('📄 Response data keys:', Object.keys(response.data || {}));
    
    if (response.data && response.data.Data) {
      console.log('🎯 Returning nested Data object for sync processing');
      return response.data.Data;
    } else {
      return response.data;
    }
    
  } catch (error: any) {
    const dataSizeMB = (JSON.stringify(data).length / 1024 / 1024).toFixed(2);
    console.error(`❌ AXIOS ERROR: ${error.message}`);
    console.error(`🔍 Error details: ${error.code || error.name || 'Unknown'}`);
    console.error(`📊 Failed request size: ${dataSizeMB}MB`);
    console.error(`🌐 Network status: ${error.code}, HTTP ${error.response?.status || 'N/A'}`);
    console.error(`🕐 Error time: ${new Date().toISOString()}`);
    
    if (error.code === 'ECONNABORTED') {
      console.error(`⏰ AXIOS TIMEOUT: Request exceeded 5 minute limit`);
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error(`🌐 NETWORK ERROR: Cannot reach server`);
    } else if (error.response?.status >= 500) {
      console.error(`🔴 SERVER ERROR: HTTP ${error.response.status}`);
    } else if (error.response?.status === 401) {
      console.error(`🔐 AUTH ERROR: Token expired or invalid`);
    }
    
    writeErrorLog('postData API call failed', error);
    throw error;
  }
};

export const getAuthData = async (headers: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.get(AUTH_ENDPOINTS.GETDATA_EP, {
    headers,
  });
  return response.data;
};

export const postDeviceID = async (headers: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(AUTH_ENDPOINTS.UPDATE_DEV_ID_EP, null, {
    headers,
  });
  return response.data;
};

export const getUserAccess = async (data: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.get(AUTH_ENDPOINTS.USERACCESS, {
    params: data,
  });
  return response.data;
};

export const getVersionForUpdate = async (data: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.get(AUTH_ENDPOINTS.CHECK_VERSION, {
    params: data,
  });
  return response.data;
};

export const postErrorReport = async (headers: any, body: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(AUTH_ENDPOINTS.REPORT_ERROR_EP, body, {
    headers,
  });

  return response.data;
};

export const postFullErrorReport = async (headers: any, body: any) => {
  const apiClient = await createApiClient();
  const response = await apiClient.post(
    AUTH_ENDPOINTS.RPORT_FULLERROR_EP,
    body,
    {
      headers,
    },
  );

  return response.data;
};

export const postDocuments = async (body: any) => {
  try {
    console.log('postDocuments', body);
    const apiClient = await createApiClient();
    const response = await apiClient.post(AUTH_ENDPOINTS.POST_DOCUMENT, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response && response.data && response.data.Data) {
      return response.data.Data;
    } else {
      console.error('Unexpected response structure:', response);
      return null;
    }
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};
export default {
  postAuthLogin,
  postOTP,
  postAuthToken,
  getAuthData,
  postData,
  postDeviceID,
  getUserAccess,
  getVersionForUpdate,
  postErrorReport,
  postFullErrorReport,
  postDocuments,
};

