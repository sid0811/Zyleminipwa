import Apis from '../api/LoginAPICalls';
import {
  getShopLocationForSync,
  insertAllData,
  getAppsideLogWriting,
} from '../database/SqlDatabase';
import {postShopGeolocation} from '../api/ShopsAPICalls';
import {fetchUserAccess, writeErrorLog} from '../utility/utils';
import {GlobleAction} from '../redux/actionHooks/useGlobalAction';

export interface GetDataOptions {
  isFromScreen: boolean;
  loaderState?: (isLoading: boolean) => void;
  isAreaIdChanged?: boolean;
  changedAreaId?: string;

  // External values
  enteredUserName: string;
  userPassword: string;
  savedClientCode: string;
  deviceId: string;
  userId: string;

  // State setters
  globalActions?: GlobleAction;

  // Optional translator (for alerts)
  showSuccessAlert?: (msg: string) => void;
}

export const getDataCore = async (options: GetDataOptions) => {
  const {
    isFromScreen,
    loaderState,
    isAreaIdChanged = false,
    changedAreaId = '0',
    enteredUserName,
    userPassword,
    savedClientCode,
    deviceId,
    userId,
    globalActions,
    showSuccessAlert,
  } = options;

  let shouldManageLoader = !!loaderState;

  try {
    const shopLocations = await getShopLocationForSync();
    await postShopGeolocation(shopLocations);
  } catch (error) {
    writeErrorLog('getDataCore shop locations', error);
    console.log('Error posting shop locations →', error);
  }

  try {
    const logData = await getAppsideLogWriting();
    globalActions?.setLogWritingEnabled?.(logData[0]?.Value === '1');
  } catch (error) {
    writeErrorLog('getDataCore AppLogWriting', error);
    console.log('Error getting AppLogWriting →', error);
  }

  try {
    const accessData = await Apis.getUserAccess({UserId: Number(userId)});
    const accessDetails = accessData?.UserAccessDetails?.[0];
    globalActions?.setAllowedBackdateDispatchDays?.(
      accessDetails?.AllowBackdatedDispatchDays ?? 0,
    );
    globalActions?.setIsPDCandUnallocatedEnable?.(
      accessDetails?.IsPDCEnabled === '1',
    );
  } catch (error) {
    writeErrorLog('getDataCore UserAccess API', error);
    console.log('Error fetching userAccess →', error);
  }

  shouldManageLoader && loaderState?.(true);
  try {
    const tokenRes = await Apis.postAuthToken({
      LoginId: enteredUserName,
      Password: userPassword,
      ClientCode: savedClientCode,
      DeviceId: deviceId,
    });

    const headers = {
      authheader: tokenRes.data.Token,
      AreaId: isAreaIdChanged ? changedAreaId : globalActions?.selectedAreaId,
    };

    try {
      const userData = await Apis.getAuthData(headers);
      insertAllData(userData);

      console.log("Checking insertion userdata",userData);
      

      isFromScreen &&
        globalActions &&
        (await fetchUserAccess(
          userId,
          globalActions,
          globalActions?.setGeofenceGlobalSettingsAction,
          null,
          globalActions?.setAccessControlSettingsAction,
        ));

      showSuccessAlert?.('Alerts.AlertUseGetDataMsg');
    } catch (error) {
      writeErrorLog('getDataCore 4th API Error', error);
      console.log('Error 4th API →', error);
      throw error; // Re-throw so caller can handle
    }
  } catch (error) {
    writeErrorLog('getDataCore Auth Token Error', error);
    console.log('Error Auth Token →', error);
    throw error; // Re-throw so caller can handle
  } finally {
    // ✅ ALWAYS cleanup loader to prevent it from getting stuck
    shouldManageLoader && loaderState?.(false);
  }
};

