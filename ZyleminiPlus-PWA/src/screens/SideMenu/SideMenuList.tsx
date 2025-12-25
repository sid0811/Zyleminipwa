import React, {useState, useEffect, useRef} from 'react';
import {Box, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {drawerList, drawerListParent} from './Component/DrawerList';
import {useGlobleAction} from '../../redux/actionHooks/useGlobalAction';
import {useLoginAction} from '../../redux/actionHooks/useLoginAction';
import {useSyncNow} from '../../hooks/useSyncNow';
import SyncProgressOverlay from '../../components/Progress/SyncProgressOverlay';
import {useGetData} from '../../hooks/useGetData';
import useLocation from '../../hooks/useLocation';

import {
  getForAutosync,
  getPItemForParentLogin,
  getParentLoginData,
} from '../../database/SqlDatabase';

import {ScreenName} from '../../constants/screenConstants';
import {
  getCurrentDateTimeT,
  resetGeofenceData,
  writeErrorLog,
  isAccessControlProvided,
  _userAccessDataDefault,
  writeActivityLog,
} from '../../utility/utils';
import {
  SaveMeetingForEndAndSubmitButton,
  ShopCheckOutFunc,
} from '../Shops/ShopsDetails/Functions/ShopDetailCommonFunc';
import {ShopCheckOutAlertHandler} from '../Order/Functions/Validations';
import {UserPreferenceKeys} from '../../constants/asyncStorageKeys';

interface menuProps {
  navigation: any;
}

const SideMenuList = (props: menuProps) => {
  const {navigation} = props;
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {
    setIsLogin,
    isLoggedin,
    accessControl,
    parentEnabled,
    isShopCheckedIn,
    blockedShopName,
    setIsSyncRefersh,
    setGeofenceGlobalSettingsAction,
    geofenceGlobalSettingsAction,
    setIsShopCheckIn,
    persistedStartTime,
    setPersistStartTime,
    setBlockedShopDetail,
    meetingEndBlocker,
    getAccessControlSettings,
  } = useGlobleAction();
  const {doSync, syncProgress, isLoading: isSyncLoading} = useSyncNow();
  const {doGetData} = useGetData();
  const {userId} = useLoginAction();
  const [settingvalue, setsettingvalue] = useState('');
  const accessControlCacheRef = useRef<string[]>([]);
  const {latitude, longitude} = useLocation();

  const onPressParent = (item: any) => {
    //writeActivityLog(`Logged Out `);
    if (item.name === t('SideMenu.LogOut')) {
      localStorage.removeItem(UserPreferenceKeys.FCM_TOKEN_KEY);
      setIsLogin(!isLoggedin);
      resetGeofenceData(setGeofenceGlobalSettingsAction);
    } else {
      item.nav();
    }
  };

  const onPressNonParent = (item: any) => {
    //writeActivityLog(`Logged Out`);
    if (item.name === t('SideMenu.LogOut')) {
      setIsLogin(!isLoggedin);
      resetGeofenceData(setGeofenceGlobalSettingsAction);
    } else
      isShopCheckedIn
        ? item.name === t('SideMenu.Shops') ||
          item.name === t('SideMenu.Activity') ||
          item.name === t('SideMenu.ReportError')
          ? item.nav()
          : ShopCheckOutAlertHandler(
              blockedShopName?.partyName,
              blockedShopName?.fromShopCheckout,
              async onPress => {
                onPress && (await CheckOutFunc());
              },
            )
        : item.nav();
  };

  //console.log('Statecheck', isNavigationSourceShops);

  const handleNavPressed = async (itemName: string) => {
    // This function will be called from the child component
    // console.log(`Navigation pressed for item: ${itemName}`);
    // You can perform additional actions here
    if (itemName === t('SideMenu.SyncNow')) {
      writeActivityLog('SyncNow');
      await getForAutosync().then((data1: any) => {
        console.log('data1[0]?.Value-->', data1[0]?.Value);
        if (data1[0]?.Value === '0') {
          navigate('/sync/expandlist');
        } else {
          doSync({
            loaderState: (val: boolean) => {
              setIsSyncRefersh?.(val);
            },
          });
        }
      });
    } else if (itemName === t('SideMenu.RefreshData')) {
      writeActivityLog('RefreshData');
      doGetData({
        isFromScreen: true,
        loaderState: (val: boolean) => {
          setIsSyncRefersh?.(val);
        },
      });
    }
  };

  const CheckOutFunc = async () => {
    if (blockedShopName?.fromShopCheckout) {
      const result = await ShopCheckOutFunc(
        blockedShopName?.shopId,
        persistedStartTime || getCurrentDateTimeT(),
        latitude || 0,
        longitude || 0,
        '',
        {
          setPersistStartTime,
          setBlockedShopDetail,
          setIsShopCheckIn,
        },
        isShopCheckedIn,
        t,
      );

      if (!result.success) {
        writeErrorLog('CheckOutFunc SideMenuList', result.error);
        console.log('SideMenuList CheckOut failed', result.error);
      }
    } else {
      try {
        SaveMeetingForEndAndSubmitButton(
          '',
          meetingEndBlocker.Meeting_Id,
          meetingEndBlocker?.EntityTypeID,
          meetingEndBlocker?.ActivityTitle,
          meetingEndBlocker?.PlannedDate,
          meetingEndBlocker?.IsActivityDone,
          meetingEndBlocker?.EntityType,
          persistedStartTime || getCurrentDateTimeT(),
          latitude,
          longitude,
          userId,
          {
            setPersistStartTime,
            setBlockedShopDetail,
            setIsShopCheckIn,
          },
          t,
        );
      } catch (error) {
        console.log('err -->', error);
      }
    }
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <SyncProgressOverlay
        visible={!!syncProgress}
        progress={syncProgress || {current: 0, total: 100, message: ''}}
        isSideMenu={true}
      />
      <Box sx={{flex: 1, overflowY: 'auto', pl: 2}}>
        {/* Sync Progress Overlay - positioned for SideMenu */}

        <Box sx={{flex: 1, ml: 2}}>
          {parentEnabled
            ? drawerListParent(t, navigation, handleNavPressed)?.map(
                (item: any, index: number) => {
                  if (
                    _userAccessDataDefault.includes(item.accessKeyValue) ||
                    isAccessControlProvided(
                      getAccessControlSettings,
                      item.accessKeyValue,
                    )
                  ) {
                    return (
                      <Box
                        key={index}
                        onClick={() => {
                          onPressParent(item);
                        }}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          mt: '4%',
                          ml: '3%',
                          cursor: 'pointer',
                          opacity:
                            item.name !== t('SideMenu.LogOut') &&
                            item.name !== t('SideMenu.SyncNow') &&
                            item.name !== t('SideMenu.RefreshData') &&
                            item.name !== t('SideMenu.Reports') &&
                            item.name !== t('SideMenu.ReportError')
                              ? 0.5
                              : 1,
                          '&:hover': {
                            opacity: 0.7,
                          },
                        }}>
                        {item.icon}
                        <Typography sx={{
                          color: '#362828',
                          fontFamily: 'Proxima Nova',
                          fontSize: '2vh',
                          fontWeight: 'normal',
                          ml: '5%',
                        }}>
                          {item.name}
                        </Typography>
                      </Box>
                    );
                  }
                  return null;
                },
              )
            : drawerList(t, navigation, handleNavPressed)?.map(
                (item: any, index: number) => {
                  let _userAccessData = _userAccessDataDefault;
                  if (
                    _userAccessData.includes(item.accessKeyValue) ||
                    isAccessControlProvided(
                      getAccessControlSettings != null &&
                        getAccessControlSettings != undefined &&
                        getAccessControlSettings.length > 0
                        ? getAccessControlSettings
                        : _userAccessData,
                      item.accessKeyValue,
                    )
                  ) {
                    return (
                      <Box
                        key={index}
                        onClick={() => {
                          onPressNonParent(item);
                        }}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          mt: '4%',
                          ml: '3%',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.7,
                          },
                        }}>
                        {item.icon}
                        <Typography sx={{
                          color: '#362828',
                          fontFamily: 'Proxima Nova',
                          fontSize: '2vh',
                          fontWeight: 'normal',
                          ml: '5%',
                        }}>
                          {item.name}
                        </Typography>
                      </Box>
                    );
                  }
                  return null;
                },
              )}
        </Box>
      </Box>
    </Box>
  );
};

export default SideMenuList;

