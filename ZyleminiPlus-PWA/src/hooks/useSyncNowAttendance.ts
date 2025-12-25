/**
 * useSyncNowAttendance Hook - PWA Version
 * Handles attendance-specific sync (check-in/check-out)
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLoginAction } from '../redux/actionHooks/useLoginAction';
import { useGlobleAction } from '../redux/actionHooks/useGlobalAction';

import {
  getOrderMasterSyncData,
  markDataAsSynced,
} from '../database/WebDatabaseHelpers';

import { dataSyncObjectKeys, writeErrorLog } from '../utility/utils';
import { postData, postAuthToken } from '../api/LoginAPICalls';
import { useNetInfo } from './useNetInfo';

interface Props {
  loaderState?: (loading: boolean) => void;
  callBack?: () => void;
}

export const useSyncNowAttendance = () => {
  const { t } = useTranslation();
  const { enteredUserName, userPassword, savedClientCode, deviceId } =
    useLoginAction();

  const { setSyncFlag, syncFlag } = useGlobleAction();
  const { isNetConnected } = useNetInfo();

  const doSyncAttendance = async ({ loaderState, callBack }: Props) => {
    try {
      if (loaderState) {
        loaderState(true);
      }

      const syncData = await collectSyncData();
      console.log('\n📊 syncData -->', syncData);

      if (Object.keys(syncData).length > 0) {
        const newToken = await refreshAuthToken();
        const syncResponse = await postSyncData(newToken, syncData);
        const { SavedData, Status, code } = syncResponse;
        console.log('\n✅ syncResponse -->', syncResponse);

        await processSyncResponse(syncResponse);

        const successStatus = 'Data saved successfully.';
        const isSuccess = Status === successStatus || code === 200 || code === '200';

        if (!isSuccess) {
          window.alert(
            t('Alerts.AlertZyleminiPlusTitle') + '\n' +
            (Status || 'Sync failed')
          );
          loaderState && loaderState(false);
        } else {
          window.alert(
            'Zylemini+\n' + 
            (Status || 'Attendance synced successfully')
          );
          loaderState && loaderState(false);
          callBack?.();
        }
      } else {
        window.alert(
          t('Alerts.AlertZyleminiPlusTitle') + '\n' +
          t('Alerts.No Data To Sync')
        );
        loaderState && loaderState(false);
      }
    } catch (error: any) {
      writeErrorLog('doSyncAttendance', error);
      if (isNetConnected === false || isNetConnected == null) {
        window.alert(
          t('Alerts.InternetConnectionUnavailable') + '\n' +
          t('Alerts.IntenetConnectionUnavailableMsg')
        );
      } else {
        window.alert(error.message || 'An error occurred');
      }
    } finally {
      loaderState && loaderState?.(false);
      setSyncFlag(!syncFlag);
      console.log('✅ Attendance sync completed', syncFlag);
    }
  };

  const collectSyncData = async () => {
    const JSONObj: any = {};

    try {
      // Get only attendance-related orders (check-in/check-out)
      // In the native code, this uses getOrderMasterSyncDataAttendanceInOut
      // We'll need to filter by collection_type for attendance
      const orderMasterData = (await getOrderMasterSyncData() as any[]);
      
      // Filter for attendance types (check-in/out: collection_type 4,8,9)
      const attendanceOrders = orderMasterData.filter((order: any) => 
        [4, 8, 9].includes(order.collection_type)
      );

      if (attendanceOrders?.length > 0) {
        JSONObj[dataSyncObjectKeys.OrderMaster] = attendanceOrders;
      }
    } catch (error) {
      console.error('❌ Error fetching order master data:', error);
      writeErrorLog('collectSyncData useSyncNowAttendance', error);
    }

    return JSONObj;
  };

  const refreshAuthToken = async () => {
    const headers = {
      LoginId: enteredUserName,
      Password: userPassword,
      ClientCode: savedClientCode,
      DeviceId: deviceId,
    };
    const res = await postAuthToken(headers);
    return res.data.Token;
  };

  const postSyncData = async (token: string, data: any) => {
    return await postData(data, token);
  };

  const processSyncResponse = async (response: any) => {
    // Handle different response formats
    let actualData = response?.Data || response?.data || response;
    
    // Alternative response format (code/message)
    if (actualData?.code !== undefined && actualData?.message !== undefined) {
      console.log('📋 Alternative response format detected');
      if (actualData.code === 200 || actualData.code === '200') {
        console.log('✅ Alternative format - sync successful');
      }
      return;
    }

    // Standard response format
    const { SavedData } = actualData;
    if (SavedData?.length > 0) {
      const orderIds = SavedData
        .map((apiData: any) => apiData.MobileGenPrimaryKey || apiData.id)
        .filter(Boolean);
      
      if (orderIds.length > 0) {
        await markDataAsSynced(orderIds);
      }
    }
  };

  return { doSyncAttendance };
};
