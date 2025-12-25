// Web-adapted useAuthentication hook
import React from 'react';
import jwtDecode from 'jwt-decode';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import { AUTH_ENDPOINTS } from '../constants/APIEndPoints';
import { useLoginAction } from '../redux/actionHooks/useLoginAction';
import Apis from '../api/LoginAPICalls';
import ApiAuth from '../api/AuthApiCall';
import cacheStorage from '../localstorage/secureStorage';
import { UserPreferenceKeys } from '../constants/asyncStorageKeys';
import {
  fetchUserAccess,
  generateRandomOTP,
  writeActivityLog,
  writeApiVersionLog,
  writeErrorLog,
} from '../utility/utils';
import cache from '../localstorage/userPreference';
import { useGlobleAction } from '../redux/actionHooks/useGlobalAction';
import { ScreenName } from '../constants/screenConstants';
import { insertAllData } from '../database/WebDatabaseHelpers';
import { versionChecking } from './utilHooks';

interface loginProp {
  user: string;
  password: string;
  SCode: string;
  deviceID: string;
  navigation?: any;
  authBackground?: boolean;
  loaderState?: any;
  isLoginScreen?: boolean;
  FcmToken?: any;
  t: any;
}

interface DecodedResponse {
  UserName?: string;
  UserId?: string;
  DeviceId?: string;
  AreaId?: string;
}

export const useAuthentication = () => {
  const navigate = useNavigate();
  
  const {
    setClientBasedURL,
    setUserName,
    setUserId,
    setDeviceId,
    setAreaId,
    setEnterUserName,
    setUserPass,
    setEnteredClientCode,
    setJWTToken,
    setSavedApiVersionAction,
    setSavedAppendedApiVersionAction,
  } = useLoginAction();

  const {
    setIsLogin,
    setMultiDivision,
    isMultiDivision,
    setParentUser,
    setParentEnabled,
    setAccessControl,
    setMenuOrder,
    setLastExecTime,
    selectedAreaId,
    setSyncFlag,
    syncFlag,
    setIsSplashShown,
    setGeofenceGlobalSettingsAction,
    setAllowedBackdateDispatchDays,
    setIsPDCandUnallocatedEnable,
    setAccessControlSettingsAction,
  } = useGlobleAction();
  
  const globalActions = useGlobleAction();
  
  const doAuth = async ({
    user,
    password,
    SCode,
    deviceID,
    FcmToken,
    authBackground = false,
    navigation,
    loaderState = false,
    isLoginScreen = false,
    t,
  }: loginProp) => {
    console.log(
      user,
      password,
      SCode,
      deviceID,
      authBackground,
      loaderState,
      FcmToken,
    );
    
    // HARDCODED FOR TESTING
    const authHeaders = {
      LoginId: user,
      Password: password,
      ClientCode: SCode,
      DeviceId: '111', // HARDCODED
      FcmToken: 'nadasdasnkajiau', // HARDCODED
      AppApiVersion: AUTH_ENDPOINTS.APP_API_VERSION,
    };

    try {
      writeApiVersionLog();
      loaderState && loaderState(true);
      
      // 🔍 DEBUG: 1st API Call
      console.log('🔐 [1st API] Starting AuthApi.postAuthApi()');
      console.log('🔐 [1st API] Headers:', JSON.stringify(authHeaders, null, 2));
      console.log('🔐 [1st API] Endpoint: AUTH_ENDPOINTS.AUTH_URL');
      
      const res = await ApiAuth.postAuthApi(authHeaders);
      
      // 🔍 DEBUG: 1st API Response
      console.log('✅ [1st API] Response received');
      console.log('✅ [1st API] Response status:', res?.status);
      console.log('✅ [1st API] Response data keys:', Object.keys(res?.data || {}));
      console.log('✅ [1st API] Token received:', res?.data?.Token ? 'YES (length: ' + res?.data?.Token.length + ')' : 'NO');
      console.log('✅ [1st API] ApiURL received:', res?.data?.ApiURL || 'NO');
      console.log('✅ [1st API] Full response data:', JSON.stringify(res?.data, null, 2));
      
      // CRITICAL: Await versionChecking to ensure BASE_URL is stored before making 2nd API call
      await versionChecking(
        res,
        setClientBasedURL,
        setSavedApiVersionAction,
        setSavedAppendedApiVersionAction,
        () => {
          loaderState && loaderState(false);
        },
        t,
      );

      // 🔍 DEBUG: Check BASE_URL after versionChecking
      // Add small delay to ensure localStorage write is complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const baseURLAfterVersionCheck = await cacheStorage.getString(UserPreferenceKeys.BASE_URL);
      console.log('🔍 [After versionChecking] BASE_URL in storage:', baseURLAfterVersionCheck || 'NOT SET');
      
      // Validate BASE_URL is set before proceeding
      if (!baseURLAfterVersionCheck) {
        const errorMsg = 'BASE_URL not set after first API call. Cannot proceed with login.';
        console.error('❌ [useAuthentication]', errorMsg);
        loaderState && loaderState(false);
        window.alert(errorMsg);
        return;
      }

      // Validate token is present before creating headers
      if (!res?.data?.Token) {
        const errorMsg = 'Authentication token not received from first API call.';
        console.error('❌ [useAuthentication]', errorMsg);
        loaderState && loaderState(false);
        window.alert(errorMsg);
        return;
      }

      // Construct headers with validation
      // HARDCODED FOR TESTING
      const headers2 = {
        LoginId: user,
        Password: password,
        ClientCode: SCode,
        DeviceId: '111', // HARDCODED
        authheader: res.data.Token, // Use res.data.Token directly (already validated)
        FcmToken: 'nadasdasnkajiau', // HARDCODED
      };

      // Validate all required headers are present
      if (!headers2.LoginId || !headers2.Password || !headers2.ClientCode || !headers2.authheader) {
        const errorMsg = 'Required headers are missing. Cannot proceed with login.';
        console.error('❌ [useAuthentication] Missing headers:', {
          LoginId: !!headers2.LoginId,
          Password: !!headers2.Password,
          ClientCode: !!headers2.ClientCode,
          authheader: !!headers2.authheader,
        });
        loaderState && loaderState(false);
        window.alert(errorMsg);
        return;
      }

      // 🔍 DEBUG: 2nd API Headers
      console.log('🔐 [2nd API] Preparing postAuthLogin()');
      console.log('🔐 [2nd API] Headers2:', JSON.stringify(headers2, null, 2));
      console.log('🔐 [2nd API] authheader token:', headers2.authheader ? 'PRESENT (length: ' + headers2.authheader.length + ')' : 'MISSING');
      console.log('🔐 [2nd API] BASE_URL will be used from storage:', baseURLAfterVersionCheck);

      // Add small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        console.log('🔐 [2nd API] Calling Apis.postAuthLogin()...');
        const takeresp = await Apis.postAuthLogin(headers2);
        console.log('✅ [2nd API] Response received');
        console.log('✅ [2nd API] Response keys:', Object.keys(takeresp || {}));
        console.log('✅ [2nd API] Message:', takeresp?.Message);
        console.log('✅ [2nd API] Token:', takeresp?.Token ? 'PRESENT (length: ' + takeresp.Token.length + ')' : 'MISSING');
        console.log('✅ [2nd API] Full response:', JSON.stringify(takeresp, null, 2));

        let generatedOTP = await generateRandomOTP();
        const otpHeader = {
          LoginId: user,
          OTP: generatedOTP,
        };

        if (takeresp?.Message == 4) {
          if (!authBackground) {
            const otpRes = await Apis.postOTP(otpHeader);
            loaderState && loaderState(false);
            cache.storeCache(UserPreferenceKeys.USER_OTP, generatedOTP);
            writeActivityLog(`Forget OTP screen`);
            // Web: Use React Router navigation
            navigate(`/${ScreenName.FORGET_OTP}`, {
              state: {
                OTPres: otpRes,
                userDetails: authHeaders,
              },
            });
          }
        } else if (takeresp?.Message != undefined) {
          loaderState && loaderState(false);
          console.log('2nd api message ===>', takeresp?.Message);
          // Web: Use browser alert for login errors
          const errorMsg = typeof takeresp?.Message === 'string' 
            ? takeresp.Message 
            : 'Login failed. Please check your credentials.';
          window.alert(errorMsg);
          return;
        } else {
          const decodedResponse: DecodedResponse = jwtDecode(takeresp?.Token);
          console.log(
            '2nd api message decodedResponse ===>',
            takeresp?.Message,
          );

          setJWTToken(takeresp?.Token);
          setUserName(decodedResponse?.UserName);
          setUserId(decodedResponse?.UserId);
          setDeviceId(decodedResponse?.DeviceId);
          setAreaId(decodedResponse?.AreaId);
          
          cacheStorage.set(UserPreferenceKeys.LOGIN_CLIENT_CODE, SCode);
          cacheStorage.set(
            UserPreferenceKeys.LOGIN_USER_ID,
            decodedResponse?.UserId,
          );
          cacheStorage.set(UserPreferenceKeys.LOGIN_LOGIN_ID, user);
          cacheStorage.set(UserPreferenceKeys.LOGIN_USER_CRED, password);
          cacheStorage.set(UserPreferenceKeys.LOGIN_USER_DEVICE_ID, deviceID);
          cacheStorage.set(
            UserPreferenceKeys.LOGIN_USER_JWT_TOKEN,
            takeresp?.Token,
          );

          try {
            const getUserAccessData = await Apis.getUserAccess({
              UserId: Number(decodedResponse?.UserId),
            });

            setMultiDivision(getUserAccessData.UserAccessDetails[0].isMultiDiv);
            setParentUser(getUserAccessData.UserAccessDetails[0].isParent);
            setParentEnabled(getUserAccessData.UserAccessDetails[0].isParent);
            setAccessControl(
              JSON.parse(getUserAccessData.UserAccessDetails[0].AccessControl),
            );
            setMenuOrder(
              JSON.parse(getUserAccessData.UserAccessDetails[0].MenuOrder),
            );
            fetchUserAccess(
              decodedResponse.UserId!,
              globalActions,
              setGeofenceGlobalSettingsAction,
              getUserAccessData,
              setAccessControlSettingsAction,
            );
            setAllowedBackdateDispatchDays(
              getUserAccessData.UserAccessDetails[0].AllowBackdatedDispatchDays,
            );
            setIsPDCandUnallocatedEnable(
              getUserAccessData?.UserAccessDetails[0]?.IsPDCEnabled === '1' ||
                false,
            );
          } catch (error) {
            writeErrorLog('getUserAccessData', error);
            console.log('error getting user access detail -->', error);
          }
        }

        try {
          const getToken = await Apis.postAuthToken(authHeaders);

          const headers4 = {
            authheader:
              takeresp?.Token != undefined ? getToken.data?.Token : null,
            AreaId: selectedAreaId,
          };

          try {
            const getUserData = await Apis.getAuthData(headers4);
            loaderState && loaderState(false);

            if (!authBackground && takeresp?.Message !== 4) {
              setEnterUserName(user);
              setUserPass(password);
              setEnteredClientCode(SCode);
              setLastExecTime(moment().format('DD-MMM-YYYY'));
              
              // Insert data into DB
              // Note: Original logic was isLoginScreen === false (background auth)
              // But we need data inserted for login screen too, so insert in both cases
              // Background auth (Splash): isLoginScreen === false → Insert data
              // Login screen: isLoginScreen === true → Also insert data (fixed)
              console.log(`📥 Inserting data from API (isLoginScreen: ${isLoginScreen})...`);
              insertAllData(getUserData).catch((error) => {
                writeErrorLog('insertAllData', error);
                console.error('❌ Error inserting data:', error);
              });
              setSyncFlag(!syncFlag);
              
              // Sets to main route
              setIsSplashShown?.(false);
              setIsLogin(true);
              // Web: Navigate to dashboard
              navigate('/dashboard');
            }
          } catch (error: any) {
            writeErrorLog('getUserData 4th API Error', error);
            console.log('4th API Error', error);
            loaderState && loaderState(false);
            // Show alert for data fetch errors
            const errorMessage = error?.response?.data?.Message || error?.message || 'Failed to fetch user data. Please try again.';
            window.alert(errorMessage);
          }
        } catch (error: any) {
          writeErrorLog('getUserData 3rd API Error', error);
          console.log('3rd API Error', error);
          loaderState && loaderState(false);
          // Show alert for token errors
          const errorMessage = error?.response?.data?.Message || error?.message || 'Failed to get authentication token. Please try again.';
          window.alert(errorMessage);
        }
      } catch (error: any) {
        writeErrorLog('getUserData 2nd API Error', error);
        console.log('2nd API Error', error);
        loaderState && loaderState(false);
        // Show alert for login errors
        const errorMessage = error?.response?.data?.Message || error?.message || 'Login failed. Please check your credentials.';
        window.alert(errorMessage);
      }
    } catch (error: any) {
      writeErrorLog('getUserData 1st API Error', error);
      console.log('1st API Error', error);
      loaderState && loaderState(false);
      // Show alert for authentication errors
      const errorMessage = error?.response?.data?.Message || error?.message || 'Authentication failed. Please try again.';
      window.alert(errorMessage);
    }
  };

  return { doAuth };
};

