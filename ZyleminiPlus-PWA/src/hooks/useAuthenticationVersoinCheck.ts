// Web-adapted useAuthenticationVersionCheck hook
import { AUTH_ENDPOINTS } from '../constants/APIEndPoints';
import ApiAuth from '../api/AuthApiCall';
import { useLoginAction } from '../redux/actionHooks/useLoginAction';
import { writeErrorLog } from '../utility/utils';
import { versionChecking } from './utilHooks';

interface authProps {
  user: string;
  password: string;
  SCode: string;
  deviceID: string;
  navigation?: any;
  loaderState?: (val: boolean) => void;
  isLoginScreen?: boolean;
  FcmToken?: any;
  t: any;
}

export const useAuthenticationVersionCheck = () => {
  const {
    setClientBasedURL,
    setSavedApiVersionAction,
    setSavedAppendedApiVersionAction,
  } = useLoginAction();
  
  const doAuthVersionCheck = async ({
    user,
    password,
    SCode,
    deviceID,
    FcmToken,
    navigation,
    loaderState = () => {},
    t,
  }: authProps) => {
    const authHeaders = {
      LoginId: user,
      Password: password,
      ClientCode: SCode,
      DeviceId: deviceID,
      FcmToken: FcmToken,
      AppApiVersion: AUTH_ENDPOINTS.APP_API_VERSION,
    };

    try {
      loaderState(true);
      const res = await ApiAuth.postAuthApi(authHeaders);
      versionChecking(
        res,
        setClientBasedURL,
        setSavedApiVersionAction,
        setSavedAppendedApiVersionAction,
        () => {
          loaderState(false);
        },
        t,
      );
    } catch (error) {
      writeErrorLog('doAuthVersionCheck', error);
      console.log('error getting user access detail -->', error);
      loaderState(false);
    }
  };
  
  return { doAuthVersionCheck };
};


