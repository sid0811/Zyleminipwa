import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import cacheStorage from '../localstorage/secureStorage';
import { UserPreferenceKeys } from '../constants/asyncStorageKeys';

/**
 * Create API client with base URL and headers
 * Adapted from React Native version
 * Automatically includes JWT token for authenticated requests
 */
const createApiClient = async (): Promise<AxiosInstance> => {
  console.log('🔐 [Client.ts] Creating API client...');
  
  // Add small delay to ensure any previous storage operations are complete
  await new Promise(resolve => setTimeout(resolve, 25));
  
  const clientBaseURL = await cacheStorage.getString(
    UserPreferenceKeys.BASE_URL,
  );
  
  console.log('🔐 [Client.ts] BASE_URL from storage:', clientBaseURL || 'NOT SET');
  
  // Retry once if BASE_URL is not found (in case of timing issue)
  let baseURL = clientBaseURL;
  if (!baseURL) {
    console.log('⚠️ [Client.ts] BASE_URL not found, retrying after delay...');
    await new Promise(resolve => setTimeout(resolve, 100));
    baseURL = await cacheStorage.getString(UserPreferenceKeys.BASE_URL);
    console.log('🔐 [Client.ts] BASE_URL after retry:', baseURL || 'NOT SET');
  }
  
  const userId = await cacheStorage.getString(UserPreferenceKeys.LOGIN_USER_ID);
  const jwtToken = await cacheStorage.getString(UserPreferenceKeys.LOGIN_USER_JWT_TOKEN);
  
  console.log('🔐 [Client.ts] LogUserId:', userId || 'NOT SET');
  console.log('🔐 [Client.ts] JWT Token:', jwtToken ? 'PRESENT (length: ' + jwtToken.length + ')' : 'NOT SET');

  // In development, use proxy to avoid CORS issues
  // In production, use the actual API URL
  const isDevelopment = import.meta.env.DEV;
  
  // Ensure baseURL is not undefined, null, or the string "undefined"
  let finalBaseURL = baseURL || import.meta.env.VITE_API_BASE_URL || '';
  if (finalBaseURL === 'undefined' || finalBaseURL === 'null' || !finalBaseURL) {
    console.error('❌ [Client.ts] BASE_URL is invalid:', finalBaseURL);
    finalBaseURL = '';
  }
  
  console.log('🔐 [Client.ts] Initial baseURL:', finalBaseURL);
  console.log('🔐 [Client.ts] Is development:', isDevelopment);
  
  // Validate baseURL before proceeding
  if (!finalBaseURL) {
    const errorMsg = 'BASE_URL is not set. Cannot create API client.';
    console.error('❌ [Client.ts]', errorMsg);
    throw new Error(errorMsg);
  }
  
  // If in development and we have a base URL, convert to relative path for proxy
  if (isDevelopment && finalBaseURL) {
    try {
      const url = new URL(finalBaseURL);
      // Extract the path and use it as relative URL to trigger Vite proxy
      // This will route through vite.config.ts proxy configuration
      const pathWithQuery = url.pathname + (url.search || '');
      console.log('🔐 [Client.ts] Parsed URL - host:', url.host, 'path:', pathWithQuery);
      console.log('🔐 [Client.ts] Full original URL:', finalBaseURL);
      
      if (pathWithQuery.startsWith('/ZyleminiPlusCoreURLAuth')) {
        finalBaseURL = pathWithQuery; // Use relative path to trigger proxy
        console.log('🔀 [Client.ts] Using proxy for API requests. Original:', baseURL, '→ Proxy:', finalBaseURL);
        console.log('🔀 [Client.ts] VERIFIED: Proxy path matches expected pattern');
        
        // Store original URL in a way the proxy can access it
        // We'll use axios interceptor to add header
      } else {
        console.warn('⚠️ [Client.ts] Path does not start with /ZyleminiPlusCoreURLAuth:', pathWithQuery);
      }
    } catch (e) {
      console.warn('⚠️ [Client.ts] Could not parse base URL:', e);
      console.warn('⚠️ [Client.ts] BASE_URL value:', finalBaseURL);
      // If URL parsing fails, check if it's already a relative path
      if (finalBaseURL.startsWith('/')) {
        // Already a relative path, use as-is
        console.log('🔀 [Client.ts] Using relative path for proxy:', finalBaseURL);
      } else {
        console.warn('⚠️ [Client.ts] Could not parse base URL for proxy, using as-is:', finalBaseURL);
      }
    }
  }
  
  console.log('✅ [Client.ts] Final baseURL for axios client:', finalBaseURL);

  const client = axios.create({
    baseURL: finalBaseURL,
    timeout: 500000, // 5 minute timeout for large sync operations
    headers: {
      'Content-Type': 'application/json',
      LogUserId: userId ? userId : '', // Used for log writing on server side
    },
  });

  // Add request interceptor to include JWT token in all requests
  client.interceptors.request.use(
    async (config) => {
      console.log('🔐 [Client.ts Interceptor] Request interceptor triggered');
      console.log('🔐 [Client.ts Interceptor] Request URL:', config.url);
      console.log('🔐 [Client.ts Interceptor] Base URL:', config.baseURL);
      console.log('🔐 [Client.ts Interceptor] Full URL:', (config.baseURL || '') + (config.url || ''));
      console.log('🔐 [Client.ts Interceptor] Method:', config.method);
      console.log('🔐 [Client.ts Interceptor] Request data:', config.data);
      
      // In development, if using proxy, we don't need to add x-original-url
      // The proxy router function handles routing based on the path
      // Adding custom headers might cause the server to reject the request
      if (isDevelopment && config.baseURL?.startsWith('/ZyleminiPlusCoreURLAuth')) {
        const currentBaseURL = await cacheStorage.getString(UserPreferenceKeys.BASE_URL);
        console.log('🔐 [Client.ts Interceptor] Using proxy, original URL:', currentBaseURL);
        console.log('🔐 [Client.ts Interceptor] Config baseURL:', config.baseURL);
        // Don't add x-original-url - let the proxy handle routing based on path
      }
      
      // Add JWT token to headers if available (but don't override if already set)
      if (jwtToken && !config.headers?.['authheader']) {
        config.headers = config.headers || {};
        config.headers['authheader'] = jwtToken;
        console.log('🔐 [Client.ts Interceptor] Added JWT token to authheader (length:', jwtToken.length + ')');
      } else if (jwtToken) {
        console.log('🔐 [Client.ts Interceptor] authheader already set in headers, not overriding');
      } else {
        console.log('⚠️ [Client.ts Interceptor] No JWT token available to add');
      }
      
      // Ensure headers object exists
      config.headers = config.headers || {};
      
      // Log final headers for debugging
      console.log('🔐 [Client.ts Interceptor] Final headers:', JSON.stringify(config.headers, null, 2));
      console.log('🔐 [Client.ts Interceptor] Header keys:', Object.keys(config.headers));
      
      return config;
    },
    (error) => {
      console.error('❌ [Client.ts Interceptor] Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor to log server responses
  client.interceptors.response.use(
    (response) => {
      console.log('✅ [Client.ts Response Interceptor] Response received');
      console.log('✅ [Client.ts Response Interceptor] Status:', response.status);
      console.log('✅ [Client.ts Response Interceptor] Status text:', response.statusText);
      console.log('✅ [Client.ts Response Interceptor] Response headers:', JSON.stringify(response.headers, null, 2));
      console.log('✅ [Client.ts Response Interceptor] Response data:', JSON.stringify(response.data, null, 2));
      return response;
    },
    (error) => {
      console.error('❌ [Client.ts Response Interceptor] Error response received');
      console.error('❌ [Client.ts Response Interceptor] Status:', error.response?.status);
      console.error('❌ [Client.ts Response Interceptor] Status text:', error.response?.statusText);
      console.error('❌ [Client.ts Response Interceptor] Response headers:', JSON.stringify(error.response?.headers, null, 2));
      console.error('❌ [Client.ts Response Interceptor] Response data:', error.response?.data);
      console.error('❌ [Client.ts Response Interceptor] Full error:', error);
      
      // Try to parse response data if it's a string
      if (error.response?.data && typeof error.response.data === 'string') {
        try {
          const parsed = JSON.parse(error.response.data);
          console.error('❌ [Client.ts Response Interceptor] Parsed error data:', parsed);
        } catch (e) {
          console.error('❌ [Client.ts Response Interceptor] Error data is plain text:', error.response.data);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

export default createApiClient;

